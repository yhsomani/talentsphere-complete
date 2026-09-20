-- ============================================================================
-- MIGRATION 008: Auth Trigger Functions & Helper Procedures
-- Critical for user lifecycle management
-- ============================================================================

-- ============================================================================
-- HANDLE NEW USER SIGNUP
-- Creates user record and default profile on auth.users insert
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Insert into users table
    INSERT INTO public.users (id, email, role, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')::user_role,
        NEW.email_confirmed_at IS NOT NULL
    )
    RETURNING id INTO new_user_id;
    
    -- If candidate, create candidate profile
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'candidate') = 'candidate' THEN
        INSERT INTO public.candidate_profiles (user_id, headline, profile_completion_percentage)
        VALUES (new_user_id, 'Seeking new opportunities', 0);
    END IF;
    
    -- Create XP ledger entry for signup bonus
    INSERT INTO public.xp_ledger (user_id, amount, transaction_type, source_type, description, balance_after)
    VALUES (new_user_id, 50, 'signup_bonus', 'auth', 'Welcome to TalentSphere! Complete your profile to earn more XP.', 50);
    
    -- Initialize user levels
    INSERT INTO public.user_levels (user_id, current_level, current_xp, xp_to_next_level, total_xp_earned)
    VALUES (new_user_id, 1, 50, 50, 50);
    
    -- Create notification preferences
    INSERT INTO public.notification_preferences (user_id)
    VALUES (new_user_id);
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, type, title, message, channel)
    VALUES (
        new_user_id,
        'system',
        'Welcome to TalentSphere!',
        'Get started by completing your profile and exploring job opportunities.',
        'in_app'
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW; -- Don't block user creation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- UPDATE USER LEVEL ON XP CHANGE
-- Automatically recalculates level when XP is earned
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
    xp_threshold INTEGER;
    level_progress NUMERIC(5,2);
    xp_for_next_level INTEGER;
BEGIN
    -- Calculate new level based on total XP
    -- Formula: level = floor(sqrt(total_xp / 100)) + 1
    new_level := FLOOR(SQRT(NEW.total_xp_earned::NUMERIC / 100.0)) + 1;
    
    -- Calculate XP threshold for current level
    xp_threshold := POWER((new_level - 1), 2) * 100;
    
    -- Calculate progress to next level
    xp_for_next_level := POWER(new_level, 2) * 100;
    level_progress := ((NEW.total_xp_earned - xp_threshold)::NUMERIC / (xp_for_next_level - xp_threshold)) * 100;
    
    -- Update user level if leveled up
    IF new_level > OLD.current_level THEN
        UPDATE public.user_levels
        SET 
            current_level = new_level,
            current_xp = NEW.total_xp_earned,
            level_progress = LEAST(level_progress, 100),
            xp_to_next_level = xp_for_next_level - NEW.total_xp_earned,
            last_level_up_at = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Create level up notification
        INSERT INTO public.notifications (user_id, type, title, message, channel)
        VALUES (
            NEW.user_id,
            'gamification',
            'Level Up! 🎉',
            format('Congratulations! You reached level %s!', new_level::TEXT),
            'in_app'
        );
    ELSE
        -- Just update XP and progress
        UPDATE public.user_levels
        SET 
            current_xp = NEW.total_xp_earned,
            level_progress = LEAST(level_progress, 100),
            xp_to_next_level = xp_for_next_level - NEW.total_xp_earned,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in update_user_level: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on xp_ledger insert
DROP TRIGGER IF EXISTS on_xp_ledger_insert ON public.xp_ledger;
CREATE TRIGGER on_xp_ledger_insert
    AFTER INSERT ON public.xp_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- ============================================================================
-- CALCULATE PROFILE COMPLETION
-- Updates profile completion percentage on profile changes
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion INTEGER := 0;
    has_headline BOOLEAN;
    has_bio BOOLEAN;
    has_location BOOLEAN;
    has_avatar BOOLEAN;
    experience_count INTEGER;
    education_count INTEGER;
    skills_count INTEGER;
    certifications_count INTEGER;
    portfolio_count INTEGER;
BEGIN
    -- Check basic fields (30%)
    SELECT 
        (headline IS NOT NULL AND headline != ''),
        (bio IS NOT NULL AND bio != ''),
        (location IS NOT NULL AND location != ''),
        (avatar_url IS NOT NULL AND avatar_url != '')
    INTO has_headline, has_bio, has_location, has_avatar
    FROM public.candidate_profiles
    WHERE user_id = NEW.user_id;
    
    IF has_headline THEN completion := completion + 6; END IF;
    IF has_bio THEN completion := completion + 6; END IF;
    IF has_location THEN completion := completion + 6; END IF;
    IF has_avatar THEN completion := completion + 6; END IF;
    
    -- Count related records (70%)
    SELECT COUNT(*) INTO experience_count FROM public.experience WHERE user_id = NEW.user_id;
    SELECT COUNT(*) INTO education_count FROM public.education WHERE user_id = NEW.user_id;
    SELECT COUNT(*) INTO skills_count FROM public.candidate_skills WHERE user_id = NEW.user_id;
    SELECT COUNT(*) INTO certifications_count FROM public.certifications WHERE user_id = NEW.user_id;
    SELECT COUNT(*) INTO portfolio_count FROM public.portfolio_items WHERE user_id = NEW.user_id;
    
    IF experience_count > 0 THEN completion := completion + 14; END IF;
    IF education_count > 0 THEN completion := completion + 14; END IF;
    IF skills_count > 0 THEN completion := completion + 14; END IF;
    IF certifications_count > 0 THEN completion := completion + 14; END IF;
    IF portfolio_count > 0 THEN completion := completion + 14; END IF;
    
    -- Update profile completion
    UPDATE public.candidate_profiles
    SET 
        profile_completion_percentage = completion,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Award XP for reaching milestones
    IF completion >= 50 AND OLD.profile_completion_percentage < 50 THEN
        INSERT INTO public.xp_ledger (user_id, amount, transaction_type, source_type, description, balance_after)
        SELECT 
            NEW.user_id,
            100,
            'profile_milestone',
            'profile',
            'Profile 50% complete!',
            COALESCE(SUM(amount), 0) + 100
        FROM public.xp_ledger
        WHERE user_id = NEW.user_id;
    END IF;
    
    IF completion >= 100 AND OLD.profile_completion_percentage < 100 THEN
        INSERT INTO public.xp_ledger (user_id, amount, transaction_type, source_type, description, balance_after)
        SELECT 
            NEW.user_id,
            200,
            'profile_complete',
            'profile',
            'Profile 100% complete! 🎉',
            COALESCE(SUM(amount), 0) + 200
        FROM public.xp_ledger
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in calculate_profile_completion: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for profile-related tables
DROP TRIGGER IF EXISTS on_profile_update ON public.candidate_profiles;
CREATE TRIGGER on_profile_update
    AFTER INSERT OR UPDATE ON public.candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

DROP TRIGGER IF EXISTS on_experience_change ON public.experience;
CREATE TRIGGER on_experience_change
    AFTER INSERT OR DELETE ON public.experience
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

DROP TRIGGER IF EXISTS on_education_change ON public.education;
CREATE TRIGGER on_education_change
    AFTER INSERT OR DELETE ON public.education
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

DROP TRIGGER IF EXISTS on_candidate_skills_change ON public.candidate_skills;
CREATE TRIGGER on_candidate_skills_change
    AFTER INSERT OR DELETE ON public.candidate_skills
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

DROP TRIGGER IF EXISTS on_certifications_change ON public.certifications;
CREATE TRIGGER on_certifications_change
    AFTER INSERT OR DELETE ON public.certifications
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

DROP TRIGGER IF EXISTS on_portfolio_change ON public.portfolio_items;
CREATE TRIGGER on_portfolio_change
    AFTER INSERT OR DELETE ON public.portfolio_items
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

-- ============================================================================
-- AWARD XP FOR CHALLENGE COMPLETION
-- Called when a challenge submission passes all tests
-- ============================================================================

CREATE OR REPLACE FUNCTION award_challenge_xp()
RETURNS TRIGGER AS $$
DECLARE
    challenge_xp INTEGER;
    first_time_bonus INTEGER := 0;
    is_first_solve BOOLEAN;
BEGIN
    -- Get challenge XP reward
    SELECT xp_reward INTO challenge_xp
    FROM public.challenges
    WHERE id = NEW.challenge_id;
    
    -- Check if this is the first successful solve
    SELECT NOT EXISTS (
        SELECT 1 FROM public.challenge_submissions
        WHERE challenge_id = NEW.challenge_id
        AND user_id = NEW.user_id
        AND status = 'accepted'
        AND submitted_at < NEW.submitted_at
    ) INTO is_first_solve;
    
    IF is_first_solve THEN
        first_time_bonus := 50; -- Bonus for first successful submission
    END IF;
    
    -- Award XP
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        INSERT INTO public.xp_ledger (user_id, amount, transaction_type, source_type, source_id, description, balance_after)
        SELECT 
            NEW.user_id,
            challenge_xp + first_time_bonus,
            'challenge_completed',
            'challenge',
            NEW.challenge_id,
            format('Completed challenge: %s%s', 
                (SELECT title FROM public.challenges WHERE id = NEW.challenge_id),
                CASE WHEN first_time_bonus > 0 THEN ' (First try!)' ELSE '' END
            ),
            COALESCE(SUM(amount), 0) + challenge_xp + first_time_bonus
        FROM public.xp_ledger
        WHERE user_id = NEW.user_id;
        
        -- Mark attempt as solved
        UPDATE public.challenge_attempts
        SET 
            is_solved = TRUE,
            completed_at = NOW(),
            best_score = GREATEST(COALESCE(best_score, 0), challenge_xp)
        WHERE challenge_id = NEW.challenge_id AND user_id = NEW.user_id;
        
        -- Send notification
        INSERT INTO public.notifications (user_id, type, title, message, channel, metadata)
        VALUES (
            NEW.user_id,
            'gamification',
            'Challenge Completed! 🏆',
            format('You earned %s XP for completing %s', 
                (challenge_xp + first_time_bonus)::TEXT,
                (SELECT title FROM public.challenges WHERE id = NEW.challenge_id)
            ),
            'in_app',
            jsonb_build_object('challenge_id', NEW.challenge_id, 'xp_earned', challenge_xp + first_time_bonus)
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in award_challenge_xp: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on challenge submissions
DROP TRIGGER IF EXISTS on_challenge_submission_complete ON public.challenge_submissions;
CREATE TRIGGER on_challenge_submission_complete
    AFTER UPDATE ON public.challenge_submissions
    FOR EACH ROW
    WHEN (NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted')
    EXECUTE FUNCTION award_challenge_xp();

-- ============================================================================
-- HELPER PROCEDURE: AWARD XP MANUALLY
-- For use in application code or admin actions
-- ============================================================================

CREATE OR REPLACE FUNCTION award_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type xp_transaction_type,
    p_source_type VARCHAR,
    p_source_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    new_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT COALESCE(SUM(amount), 0) INTO new_balance
    FROM public.xp_ledger
    WHERE user_id = p_user_id;
    
    new_balance := new_balance + p_amount;
    
    -- Insert ledger entry
    INSERT INTO public.xp_ledger (user_id, amount, transaction_type, source_type, source_id, description, balance_after)
    VALUES (p_user_id, p_amount, p_transaction_type, p_source_type, p_source_id, p_description, new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEANUP: Delete user data on account deletion
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Note: Most related data will be deleted via ON DELETE CASCADE
    -- This trigger is for any additional cleanup needed
    
    -- Log deletion for audit purposes
    INSERT INTO public.application_activity_log (application_id, actor_id, action, metadata)
    SELECT 
        id,
        OLD.user_id,
        'account_deleted',
        jsonb_build_object('email', OLD.email)
    FROM public.users
    WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

