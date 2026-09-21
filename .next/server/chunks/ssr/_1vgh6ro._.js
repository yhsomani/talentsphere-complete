module.exports=[19107,a=>{"use strict";var b=a.i(64831);let c={name:"arrow-left",size:24,node:[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]};c.node;let d=(0,b.default)(c);a.s(["ArrowLeft",0,d],19107)},18783,a=>{"use strict";var b=a.i(64831);let c={name:"arrow-right",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]};c.node;let d=(0,b.default)(c);a.s(["ArrowRight",0,d],18783)},79362,a=>{"use strict";var b=a.i(64831);let c={name:"circle-check-big",size:24,node:[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],aliases:["check-circle"]};c.node;let d=(0,b.default)(c);a.s(["CheckCircle",0,d],79362)},11134,a=>{"use strict";var b=a.i(64831);let c={name:"circle-x",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],aliases:["x-circle"]};c.node;let d=(0,b.default)(c);a.s(["XCircle",0,d],11134)},8311,a=>{"use strict";var b=a.i(64831);let c={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};c.node;let d=(0,b.default)(c);a.s(["Clock",0,d],8311)},68370,a=>{"use strict";var b=a.i(64831);let c={name:"external-link",size:24,node:[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]};c.node;let d=(0,b.default)(c);a.s(["ExternalLink",0,d],68370)},54098,a=>{"use strict";var b=a.i(64831);let c={name:"map-pin",size:24,node:[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]};c.node;let d=(0,b.default)(c);a.s(["MapPin",0,d],54098)},3512,a=>{"use strict";var b=a.i(64831);let c={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};c.node;let d=(0,b.default)(c);a.s(["Plus",0,d],3512)},33540,a=>{"use strict";var b=a.i(64831);let c={name:"search",size:24,node:[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]};c.node;let d=(0,b.default)(c);a.s(["Search",0,d],33540)},74746,a=>{"use strict";var b=a.i(64831);let c={name:"send",size:24,node:[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]};c.node;let d=(0,b.default)(c);a.s(["Send",0,d],74746)},51723,a=>{"use strict";var b=a.i(16031);function c(a,c){if(!a||""===a.trim())throw b.AppErrors.configuration(`Missing required configuration: ${c}`,{key:c,provided:a??"undefined"});return a.trim()}function d(a,c,d){if(!a)return c;let e=parseInt(a,10);if(isNaN(e)||e<=0)throw b.AppErrors.configuration(`Invalid positive integer for ${d}: ${a}`,{key:d,provided:a});return e}function e(a,b){return a?"true"===a.toLowerCase()||"1"===a:b}function f(){let a=a=>process.env[a],f=c(a("NEXT_PUBLIC_SUPABASE_URL")||a("SUPABASE_URL"),"SUPABASE_URL"),g=c(a("NEXT_PUBLIC_SUPABASE_ANON_KEY")||a("SUPABASE_ANON_KEY"),"SUPABASE_ANON_KEY"),h=function(a){let c=["development","staging","production","test"],d=a.toLowerCase();if(!c.includes(d))throw b.AppErrors.configuration(`Invalid environment: ${a}. Must be one of: ${c.join(", ")}`,{provided:a,valid:c});return d}(c(a("NEXT_PUBLIC_ENVIRONMENT")||a("NODE_ENV")||"development","NODE_ENV"));return{required:{supabaseUrl:f,supabaseAnonKey:g,environment:h,appBaseUrl:function(a,c){try{return new URL(a),a}catch{throw b.AppErrors.configuration(`Invalid URL format for ${c}: ${a}`,{key:c,provided:a})}}(c(a("NEXT_PUBLIC_APP_URL")||a("APP_URL")||"http://localhost:3000","APP_URL"),"APP_URL")},optional:{supabaseServiceKey:a("SUPABASE_SERVICE_ROLE_KEY"),stripePublicKey:a("NEXT_PUBLIC_STRIPE_PUBLIC_KEY")||a("STRIPE_PUBLIC_KEY"),stripeWebhookSecret:a("STRIPE_WEBHOOK_SECRET"),resendApiKey:a("RESEND_API_KEY"),githubClientId:a("GITHUB_CLIENT_ID"),githubClientSecret:a("GITHUB_CLIENT_SECRET"),googleClientId:a("GOOGLE_CLIENT_ID"),googleClientSecret:a("GOOGLE_CLIENT_SECRET"),sentryDsn:a("NEXT_PUBLIC_SENTRY_DSN")||a("SENTRY_DSN"),posthogApiKey:a("NEXT_PUBLIC_POSTHOG_KEY")||a("POSTHOG_KEY"),featureFlagsEnabled:e(a("FEATURE_FLAGS_ENABLED"),!1),maintenanceMode:e(a("MAINTENANCE_MODE"),!1),maxUploadSizeMB:d(a("MAX_UPLOAD_SIZE_MB"),10,"MAX_UPLOAD_SIZE_MB"),sessionTimeoutMinutes:d(a("SESSION_TIMEOUT_MINUTES"),30,"SESSION_TIMEOUT_MINUTES"),rateLimitPerMinute:d(a("RATE_LIMIT_PER_MINUTE"),100,"RATE_LIMIT_PER_MINUTE")}}}function g(a){let b=i();return(!!["stripePublicKey","resendApiKey","githubClientId","googleClientId","sentryDsn","posthogApiKey"].includes(a)||"featureFlagsEnabled"===a||"maintenanceMode"===a)&&!!b.optional[a]}let h=null;function i(){return h||(h=f()),h}a.s(["assertFeatureRequired",0,function(a,c){if(!g(c))throw b.AppErrors.serviceUnavailable(a,`${a} is not configured. Missing environment variable.`,{configKey:c})},"getConfig",0,i,"getConfigValue",0,function(a){return i().optional[a]},"getFeatureStatus",0,function(){let a=i();return{payments:!!a.optional.stripePublicKey,emailNotifications:!!a.optional.resendApiKey,githubAuth:!!a.optional.githubClientId,googleAuth:!!a.optional.googleClientId,errorTracking:!!a.optional.sentryDsn,analytics:!!a.optional.posthogApiKey,featureFlags:!0===a.optional.featureFlagsEnabled,maintenanceMode:!0===a.optional.maintenanceMode}},"isDevelopment",0,function(){return"development"===i().required.environment},"isFeatureEnabled",0,g,"isMaintenanceMode",0,function(){return!0===i().optional.maintenanceMode},"isProduction",0,function(){return"production"===i().required.environment},"isTest",0,function(){return"test"===i().required.environment},"loadConfig",0,f,"resetConfig",0,function(){h=null}])},2046,a=>{"use strict";var b=a.i(16031),c=a.i(64981),d=a.i(6);let e=(0,c.createDatabaseAdapter)({supabaseUrl:d.AppConfig.supabase.url,supabaseKey:d.AppConfig.supabase.anonKey}),f=new class{db;constructor(a){this.db=a}async submitApplication(a){try{if(!a.jobId||!a.candidateProfileId)throw b.AppErrors.validation("Job ID and Candidate Profile ID are required",{context:{jobId:!!a.jobId,candidateProfileId:!!a.candidateProfileId}});let{data:c,error:d}=await this.db.from("applications").insert({job_id:a.jobId,candidate_profile_id:a.candidateProfileId,cover_letter:a.coverLetter||null,resume_url:a.resumeUrl||null,portfolio_urls:a.portfolioUrls||[],answers_to_questions:a.answersToQuestions||{},referral_source:a.referralSource||null,status:"submitted"}).select(`
          *,
          jobs (
            id,
            title,
            slug,
            job_type,
            work_mode,
            location_city,
            salary_min,
            salary_max,
            salary_currency,
            salary_period,
            status,
            organizations (
              id,
              name,
              logo_url,
              industry
            )
          )
        `).single();if(d)throw b.AppErrors.database("Failed to submit application",{cause:d,context:{jobId:a.jobId,candidateProfileId:a.candidateProfileId}});try{let a=await this.db.auth.getUser(),b=c?.id||"",d=await this.db.from("application_activity_log").insert({application_id:b,actor_id:a.data?.user?.id||null,action:"application_submitted",new_value:{status:"submitted"},metadata:{timestamp:new Date().toISOString()}}).execute();d.error&&console.warn("Activity log insert returned error:",d.error)}catch(a){console.warn("Non-blocking activity log failed:",a)}return c}catch(c){if((0,b.isAppError)(c))throw c;throw b.AppErrors.database("Unexpected error submitting application",{cause:c,context:{jobId:a.jobId,candidateProfileId:a.candidateProfileId}})}}async checkHasApplied(a,c){try{let{data:d,error:e}=await this.db.from("applications").select(`
          id,
          job_id,
          candidate_profile_id,
          status,
          applied_at,
          current_stage_id,
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `).eq("job_id",a).eq("candidate_profile_id",c).maybeSingle();if(e)throw b.AppErrors.database("Failed to check application status",{cause:e,context:{jobId:a,candidateProfileId:c}});return d}catch(a){return(0,b.isAppError)(a)?console.error("Error checking application status:",a.toSafeObject()):console.error("Error checking application status:",a),null}}async getCandidateApplications(a){try{let{data:c,error:d}=await this.db.from("applications").select(`
          *,
          jobs (
            id,
            title,
            slug,
            job_type,
            work_mode,
            location_city,
            salary_min,
            salary_max,
            salary_currency,
            salary_period,
            status,
            organizations (
              id,
              name,
              logo_url,
              industry
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `).eq("candidate_profile_id",a).order("applied_at",{ascending:!1});if(d)throw b.AppErrors.database("Failed to fetch candidate applications",{cause:d,context:{candidateProfileId:a}});return c||[]}catch(c){if((0,b.isAppError)(c))throw c;throw b.AppErrors.database("Unexpected error fetching candidate applications",{cause:c,context:{candidateProfileId:a}})}}async getApplicationById(a){try{let{data:c,error:d}=await this.db.from("applications").select(`
          *,
          jobs (
            id,
            title,
            slug,
            description,
            requirements,
            responsibilities,
            benefits,
            job_type,
            work_mode,
            experience_level,
            location_city,
            salary_min,
            salary_max,
            salary_currency,
            salary_period,
            status,
            organizations (
              id,
              name,
              logo_url,
              industry,
              description,
              website
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type,
            description
          )
        `).eq("id",a).single();if(d)throw b.AppErrors.database("Failed to fetch application",{cause:d,context:{applicationId:a}});let{data:e,error:f}=await this.db.from("application_activity_log").select("*").eq("application_id",a).order("created_at",{ascending:!1});return f&&console.warn("Failed to fetch activity log, continuing without it:",f),{application:c,activityLog:e||[]}}catch(c){if((0,b.isAppError)(c))throw c;throw b.AppErrors.database("Unexpected error fetching application",{cause:c,context:{applicationId:a}})}}async withdrawApplication(a,c){try{let{error:d}=await this.db.from("applications").update({status:"withdrawn",updated_at:new Date().toISOString()}).eq("id",a).eq("candidate_profile_id",c);if(d)throw b.AppErrors.database("Failed to withdraw application",{cause:d,context:{applicationId:a,candidateProfileId:c}});try{let b=await this.db.auth.getUser();await this.db.from("application_activity_log").insert({application_id:a,actor_id:b.data?.user?.id||null,action:"application_withdrawn",new_value:{status:"withdrawn"}})}catch{}return!0}catch(d){if((0,b.isAppError)(d))throw d;throw b.AppErrors.database("Unexpected error withdrawing application",{cause:d,context:{applicationId:a,candidateProfileId:c}})}}async getJobApplications(a){try{let{data:c,error:d}=await this.db.from("applications").select(`
          *,
          candidate_profiles (
            id,
            headline,
            summary,
            location_city,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `).eq("job_id",a).order("applied_at",{ascending:!1});if(d)throw b.AppErrors.database("Failed to fetch job applications",{cause:d,context:{jobId:a}});return c||[]}catch(c){if((0,b.isAppError)(c))throw c;throw b.AppErrors.database("Unexpected error fetching job applications",{cause:c,context:{jobId:a}})}}async updateApplicationStage(a,b,c,d){return this.updateApplicationStatus(a,c,b,d)}async updateApplicationStatus(a,c,d,e){try{let f={status:c,updated_at:new Date().toISOString()};void 0!==d&&(f.current_stage_id=d),["offer_extended","offer_accepted","offer_declined","rejected"].includes(c)&&(f.decision_at=new Date().toISOString()),"submitted"!==c&&(f.reviewed_at=new Date().toISOString());let{error:g}=await this.db.from("applications").update(f).eq("id",a);if(g)throw b.AppErrors.database("Failed to update application status",{cause:g,context:{applicationId:a,status:c,stageId:d}});try{let b=await this.db.auth.getUser();await this.db.from("application_activity_log").insert({application_id:a,actor_id:b.data?.user?.id||null,action:`status_changed_to_${c}`,new_value:{status:c,stage_id:d||null,note:e||null},metadata:{timestamp:new Date().toISOString(),note:e||null}})}catch(a){console.warn("Non-blocking activity log failed:",a)}return!0}catch(e){if((0,b.isAppError)(e))throw e;throw b.AppErrors.database("Unexpected error updating application status",{cause:e,context:{applicationId:a,status:c,stageId:d}})}}async getPipelineStages(a){try{let c=this.db.from("hiring_pipeline_stages").select("*").order("order_index",{ascending:!0});a&&(c=c.or(`organization_id.is.null,organization_id.eq.${a}`));let{data:d,error:e}=await c;if(e)throw b.AppErrors.database("Failed to fetch pipeline stages",{cause:e,context:{organizationId:a}});return d||[]}catch(a){return(0,b.isAppError)(a)?console.error("Error fetching pipeline stages:",a.toSafeObject()):console.error("Error fetching pipeline stages:",a),[]}}async getRecruiterOverview(a,c){try{let d=this.db.from("jobs").select("id, title, department, location_city, work_mode, status, created_at, application_count").order("created_at",{ascending:!1});d=c?d.or(`employer_id.eq.${a},organization_id.eq.${c}`):d.eq("employer_id",a);let{data:e,error:f}=await d;if(f)throw b.AppErrors.database("Failed to fetch recruiter jobs",{cause:f,context:{recruiterUserId:a,organizationId:c}});if(!e||0===e.length)return{jobs:[],recentApplications:[]};let g=e.map(a=>a.id),{data:h,error:i}=await this.db.from("applications").select(`
          *,
          jobs (
            id,
            title,
            slug,
            job_type,
            work_mode,
            location_city,
            status
          ),
          candidate_profiles (
            id,
            headline,
            summary,
            location_city,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `).in("job_id",g).order("applied_at",{ascending:!1}).limit(50);if(i)throw b.AppErrors.database("Failed to fetch recent applications",{cause:i,context:{jobIds:g}});return{jobs:e||[],recentApplications:h||[]}}catch(a){return(0,b.isAppError)(a)?console.error("Error fetching recruiter overview:",a.toSafeObject()):console.error("Error fetching recruiter overview:",a),{jobs:[],recentApplications:[]}}}async getScorecards(a){try{let{data:c,error:d}=await this.db.from("scorecards").select(`
          *,
          users!interviewer_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `).eq("application_id",a).order("submitted_at",{ascending:!1});if(d)throw b.AppErrors.database("Failed to fetch scorecards",{cause:d,context:{applicationId:a}});return c||[]}catch(a){return(0,b.isAppError)(a)?console.error("Error fetching scorecards:",a.toSafeObject()):console.error("Error fetching scorecards:",a),[]}}async createScorecard(a){try{let{data:c,error:d}=await this.db.from("scorecards").insert({application_id:a.applicationId,interviewer_id:a.interviewerId,stage_id:a.stageId||null,overall_decision:a.overallDecision,overall_score:a.overallScore,technical_score:a.technicalScore??null,communication_score:a.communicationScore??null,culture_fit_score:a.cultureFitScore??null,problem_solving_score:a.problemSolvingScore??null,leadership_score:a.leadershipScore??null,comments:a.comments||null,strengths:a.strengths||[],weaknesses:a.weaknesses||[],would_rehire:a.wouldRehire??!0}).select(`
          *,
          users!interviewer_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `).single();if(d)throw b.AppErrors.database("Failed to create scorecard",{cause:d,context:{applicationId:a.applicationId,interviewerId:a.interviewerId}});return c}catch(c){if((0,b.isAppError)(c))throw c;throw b.AppErrors.database("Unexpected error creating scorecard",{cause:c,context:{applicationId:a.applicationId,interviewerId:a.interviewerId}})}}}(e);a.s(["applicationService",0,f])},57680,a=>{"use strict";var b=a.i(16031);class c{db;constructor(a){this.db=a}async getJobs(a={},c=1,d=20){try{let b=await this.db.list("jobs",{pagination:{page:c,pageSize:d,orderBy:"created_at",ascending:!1}});if(b.error)throw b.error;let e=b.data;a.search&&(e=e.filter(b=>b.title?.toLowerCase().includes(a.search.toLowerCase())||b.description?.toLowerCase().includes(a.search.toLowerCase()))),a.location&&(e=e.filter(b=>b.location_city===a.location)),a.jobType&&(e=e.filter(b=>b.job_type===a.jobType)),a.workLocation&&(e=e.filter(b=>b.work_mode===a.workLocation)),a.experienceLevel&&(e=e.filter(b=>b.experience_level===a.experienceLevel)),void 0!==a.salaryMin&&(e=e.filter(b=>(b.salary_min??0)>=a.salaryMin)),void 0!==a.salaryMax&&(e=e.filter(b=>(b.salary_max??0)<=a.salaryMax)),a.organizationId&&(e=e.filter(b=>b.organization_id===a.organizationId)),a.status&&(e=e.filter(b=>b.status===a.status));let f=new Set;e.forEach(a=>{Array.isArray(a.required_skills)&&a.required_skills.forEach(a=>{"string"==typeof a&&f.add(a)}),Array.isArray(a.preferred_skills)&&a.preferred_skills.forEach(a=>{"string"==typeof a&&f.add(a)})});let g=new Map;if(f.size>0){let a=await this.db.list("skills");!a.error&&a.data&&a.data.forEach(a=>g.set(a.id,a))}return{jobs:e.map(a=>{let b=a.users,[c="",...d]=(b?.full_name||"").split(" ");return{...a,posted_by:b?{id:b.id,full_name:b.full_name||"",first_name:c,last_name:d.join(" "),email:b.email||"",avatar_url:b.avatar_url||""}:void 0,skills:Array.isArray(a.required_skills)?a.required_skills.map(a=>"string"==typeof a?g.get(a):null).filter(Boolean):[]}}),total:b.count??e.length,page:c,limit:d,hasMore:(c-1)*d+e.length<(b.count??e.length)}}catch(e){throw console.error("Error fetching jobs:",e),b.AppErrors.database("Failed to fetch jobs",{filters:a,page:c,limit:d},e instanceof Error?e:void 0)}}async getJobById(a){try{let c=await this.db.getById("jobs",a);if(c.error)throw c.error;if(!c.data)throw b.AppErrors.notFound("Job",a);let d=c.data,e=[...Array.isArray(d.required_skills)?d.required_skills:[],...Array.isArray(d.preferred_skills)?d.preferred_skills:[]].filter(a=>"string"==typeof a),f=[];if(e.length>0){let a=await this.db.list("skills");!a.error&&a.data&&(f=a.data.filter(a=>e.includes(a.id)))}let g=d.users,[h="",...i]=(g?.full_name||"").split(" ");return{...d,posted_by:g?{id:g.id,full_name:g.full_name||"",first_name:h,last_name:i.join(" "),email:g.email||"",avatar_url:g.avatar_url||""}:void 0,skills:f}}catch(c){if(console.error("Error fetching job:",c),(0,b.isAppError)(c))throw c;throw b.AppErrors.database("Failed to fetch job",{jobId:a},c instanceof Error?c:void 0)}}async getRecruiterJobs(a,c){try{let b=await this.db.list("jobs",{filters:{employer_id:a,...c?{status:c}:{}},pagination:{orderBy:"created_at",ascending:!1}});if(b.error)throw b.error;return b.data}catch(d){throw console.error("Error fetching recruiter jobs:",d),b.AppErrors.database("Failed to fetch recruiter jobs",{recruiterId:a,status:c},d instanceof Error?d:void 0)}}async createJob(a){try{let b=await this.db.insert("jobs",a);if(b.error)throw b.error;return b.data}catch(c){throw console.error("Error creating job:",c),b.AppErrors.database("Failed to create job",{jobData:a},c instanceof Error?c:void 0)}}async updateJob(a,c){try{let b=await this.db.update("jobs",a,{...c,updated_at:new Date().toISOString()});if(b.error)throw b.error;return b.data}catch(d){throw console.error("Error updating job:",d),b.AppErrors.database("Failed to update job",{jobId:a,updates:c},d instanceof Error?d:void 0)}}async deleteJob(a){try{let b=await this.db.delete("jobs",a);if(b.error)throw b.error;return!0}catch(c){throw console.error("Error deleting job:",c),b.AppErrors.database("Failed to delete job",{jobId:a},c instanceof Error?c:void 0)}}async getJobStats(a){try{let b=await this.db.query("SELECT * FROM get_job_stats($1)",[a]);if(b.error)throw b.error;return b.data?.[0]}catch(c){throw console.error("Error fetching job stats:",c),b.AppErrors.database("Failed to fetch job stats",{recruiterId:a},c instanceof Error?c:void 0)}}async searchJobs(a,b=10){try{let c=await this.db.query("SELECT * FROM search_jobs($1, $2)",[a,b]);if(c.error)return console.error("Error searching jobs:",c.error),[];return c.data}catch(a){return console.error("Error searching jobs:",a),[]}}async getRecommendedJobs(a,b=10){try{let c=await this.db.query("SELECT * FROM get_recommended_jobs($1, $2)",[a,b]);if(c.error)return console.error("Error getting recommended jobs:",c.error),[];return c.data}catch(a){return console.error("Error getting recommended jobs:",a),[]}}async getSimilarJobs(a,b=5){try{let c=await this.db.query("SELECT * FROM get_similar_jobs($1, $2)",[a,b]);if(c.error)return console.error("Error getting similar jobs:",c.error),[];return c.data}catch(a){return console.error("Error getting similar jobs:",a),[]}}async getUniqueLocations(){try{let a=await this.db.list("jobs",{filters:{status:"active"}});if(a.error)throw a.error;return(a.data||[]).map(a=>a.location_city).filter((a,b,c)=>!!a&&c.indexOf(a)===b).sort()}catch(a){return console.error("Error fetching locations:",a),[]}}async getUniqueSkills(){try{let a=await this.db.list("skills",{pagination:{orderBy:"name",ascending:!0}});if(a.error)throw a.error;return a.data}catch(a){return console.error("Error fetching skills:",a),[]}}async bookmarkJob(a,c){try{let b=await this.db.insert("job_bookmarks",{job_id:a,user_id:c});if(b.error)throw b.error;return b.data}catch(d){throw console.error("Error bookmarking job:",d),b.AppErrors.database("Failed to bookmark job",{jobId:a,userId:c},d instanceof Error?d:void 0)}}async removeBookmark(a,c){try{let b=await this.db.delete("job_bookmarks",`${a}_${c}`);if(b.error)throw b.error;return!0}catch(d){throw console.error("Error removing bookmark:",d),b.AppErrors.database("Failed to remove bookmark",{jobId:a,userId:c},d instanceof Error?d:void 0)}}async getBookmarkedJobs(a){try{let b=await this.db.list("job_bookmarks",{filters:{user_id:a},pagination:{orderBy:"created_at",ascending:!1}});if(b.error)throw b.error;return(b.data||[]).map(a=>a.jobs).filter(Boolean)}catch(a){return console.error("Error fetching bookmarked jobs:",a),[]}}}let d=null,e=(()=>{if(!d)try{let{createDatabaseAdapter:b}=a.r(64981),{getConfig:e}=a.r(51723),f=e(),g=b({supabaseUrl:f.required.supabaseUrl,supabaseKey:f.required.supabaseAnonKey});d=new c(g)}catch(a){throw console.warn("[JobService] Synchronous initialization failed. Use initJobService() for async usage."),a}return d})();a.s(["jobService",0,e,"jobsService",0,e])}];

//# sourceMappingURL=_1vgh6ro._.js.map