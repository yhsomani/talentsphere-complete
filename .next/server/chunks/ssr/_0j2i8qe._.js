module.exports=[19107,a=>{"use strict";var b=a.i(64831);let c={name:"arrow-left",size:24,node:[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]};c.node;let d=(0,b.default)(c);a.s(["ArrowLeft",0,d],19107)},68522,a=>{"use strict";var b=a.i(64831);let c={name:"building-complex",size:24,node:[["path",{d:"M10 12h4",key:"a56b0p"}],["path",{d:"M10 8h4",key:"1sr2af"}],["path",{d:"M14 21v-3a2 2 0 0 0-4 0v3",key:"1rgiei"}],["path",{d:"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",key:"secmi2"}],["path",{d:"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",key:"16ra0t"}]],aliases:["building-2"]};c.node;let d=(0,b.default)(c);a.s(["Building2",0,d],68522)},70944,a=>{"use strict";var b=a.i(64831);let c={name:"calendar",size:24,node:[["path",{d:"M8 2v3",key:"1ioesn"}],["path",{d:"M16 2v3",key:"otl347"}],["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",key:"h1oib"}],["path",{d:"M3 9h18",key:"1pudct"}]]};c.node;let d=(0,b.default)(c);a.s(["Calendar",0,d],70944)},13412,a=>{"use strict";var b=a.i(64831);let c={name:"circle-check",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 9-5.5 5.5L8 12",key:"xofnsj"}]],aliases:["check-circle-2"]};c.node;let d=(0,b.default)(c);a.s(["CheckCircle2",0,d],13412)},8311,a=>{"use strict";var b=a.i(64831);let c={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};c.node;let d=(0,b.default)(c);a.s(["Clock",0,d],8311)},68370,a=>{"use strict";var b=a.i(64831);let c={name:"external-link",size:24,node:[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]};c.node;let d=(0,b.default)(c);a.s(["ExternalLink",0,d],68370)},54098,a=>{"use strict";var b=a.i(64831);let c={name:"map-pin",size:24,node:[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]};c.node;let d=(0,b.default)(c);a.s(["MapPin",0,d],54098)},40701,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(2046),f=a.i(72559),g=a.i(49483),h=a.i(89251),i=a.i(19107),j=a.i(54098),k=a.i(70944),l=a.i(8311),m=a.i(68370),n=a.i(13412),o=a.i(97546),p=a.i(83138),q=a.i(64831);let r={name:"link",size:24,node:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]]};r.node;let s=(0,q.default)(r),t={name:"circle-dot",size:24,node:[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]};t.node;let u=(0,q.default)(t);var v=a.i(68522),w=a.i(86708);a.s(["default",0,function({applicationId:a}){let[q,r]=(0,c.useState)(null),[t,x]=(0,c.useState)(!0),[y,z]=(0,c.useState)(null);if((0,c.useEffect)(()=>{let b=async()=>{try{x(!0),z(null);let b=await e.applicationService.getApplicationById(a);r(b)}catch(a){console.error("Error fetching application detail:",a),z("Failed to load application details.")}finally{x(!1)}};a&&b()},[a]),t)return(0,b.jsx)(h.default,{userRole:"candidate",children:(0,b.jsx)("div",{className:"min-h-[60vh] flex items-center justify-center",children:(0,b.jsx)(g.default,{size:"lg"})})});if(y||!q)return(0,b.jsx)(h.default,{userRole:"candidate",children:(0,b.jsxs)("div",{className:"max-w-2xl mx-auto py-16 text-center",children:[(0,b.jsx)("div",{className:"w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100",children:(0,b.jsx)(o.AlertCircle,{className:"w-8 h-8"})}),(0,b.jsx)("h2",{className:"text-2xl font-bold text-slate-900 mb-2",children:"Application Not Found"}),(0,b.jsx)("p",{className:"text-slate-600 mb-6",children:y||"This application does not exist or you do not have permission to view it."}),(0,b.jsx)(d.default,{href:"/applications",children:(0,b.jsxs)(f.Button,{variant:"primary",className:"gap-2",children:[(0,b.jsx)(i.ArrowLeft,{className:"w-4 h-4"}),"Back to My Applications"]})})]})});let{application:A,activityLog:B}=q,C=A.applied_at?new Date(A.applied_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"Recently";return(0,b.jsx)(h.default,{userRole:"candidate",children:(0,b.jsxs)("div",{className:"space-y-8",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2 text-sm text-slate-500",children:[(0,b.jsxs)(d.default,{href:"/applications",className:"inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors",children:[(0,b.jsx)(i.ArrowLeft,{className:"w-4 h-4"}),"Applications"]}),(0,b.jsx)("span",{className:"text-slate-300",children:"/"}),(0,b.jsx)("span",{className:"text-slate-900 font-medium truncate max-w-xs sm:max-w-md",children:A.jobs?.title||"Application Details"})]}),(0,b.jsxs)(f.Card,{className:"p-6 sm:p-8 border-slate-200/80 shadow-sm",children:[(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100",children:[(0,b.jsxs)("div",{className:"flex items-start gap-4",children:[(0,b.jsx)("div",{className:"w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm",children:(0,b.jsx)(f.Avatar,{src:A.jobs?.organizations?.logo_url||void 0,alt:A.jobs?.organizations?.name||"Company",fallback:A.jobs?.organizations?.name?.charAt(0)||"C",size:"lg"})}),(0,b.jsxs)("div",{className:"space-y-1",children:[(0,b.jsx)("h1",{className:"text-2xl sm:text-3xl font-bold tracking-tight text-slate-900",children:A.jobs?.title||"Applied Position"}),(0,b.jsxs)("p",{className:"text-base font-semibold text-slate-700 flex items-center gap-2",children:[(0,b.jsx)(v.Building2,{className:"w-4 h-4 text-slate-400"}),A.jobs?.organizations?.name||"Company"]}),(0,b.jsxs)("div",{className:"flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500",children:[(0,b.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,b.jsx)(j.MapPin,{className:"w-3.5 h-3.5 text-slate-400"}),A.jobs?.work_mode==="remote"?"Remote":A.jobs?.location_city||"On-site"]}),(0,b.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,b.jsx)(k.Calendar,{className:"w-3.5 h-3.5 text-slate-400"}),"Submitted on ",C]})]})]})]}),(0,b.jsxs)("div",{className:"flex flex-col sm:items-end gap-3 shrink-0",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("span",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Status:"}),(a=>{switch(a){case"submitted":return(0,b.jsx)(f.Badge,{variant:"info",children:"Submitted"});case"screening":case"under_review":return(0,b.jsx)(f.Badge,{variant:"warning",children:"Under Review"});case"interview_scheduled":case"interviewed":return(0,b.jsx)(f.Badge,{variant:"secondary",children:"Interview Stage"});case"offer_extended":case"offer_accepted":return(0,b.jsx)(f.Badge,{variant:"success",children:"Offer Extended 🎉"});case"rejected":return(0,b.jsx)(f.Badge,{variant:"danger",children:"Not Selected"});case"withdrawn":return(0,b.jsx)(f.Badge,{variant:"default",children:"Withdrawn"});default:return(0,b.jsx)(f.Badge,{variant:"default",children:a.replace("_"," ")})}})(A.status)]}),(0,b.jsxs)(d.default,{href:`/jobs/${A.job_id}`,className:"inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg border border-indigo-200/50 transition-colors",children:["View Job Posting",(0,b.jsx)(m.ExternalLink,{className:"w-3 h-3"})]})]})]}),(0,b.jsxs)("div",{className:"pt-8",children:[(0,b.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,b.jsxs)("h3",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2",children:[(0,b.jsx)(w.Sparkles,{className:"w-3.5 h-3.5 text-indigo-500"}),"Pipeline Progression"]}),A.hiring_pipeline_stages?.name&&(0,b.jsxs)("span",{className:"text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100",children:["Current Stage: ",A.hiring_pipeline_stages.name]})]}),(0,b.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-4 gap-3",children:[{key:"submitted",label:"Application Submitted",desc:"Received & logged"},{key:"screening",label:"Resume Screening",desc:"Recruiter evaluation"},{key:"interview_scheduled",label:"Technical & Team Interviews",desc:"Interactive rounds"},{key:"offer_extended",label:"Decision & Offer",desc:"Compensation review"}].map((a,c)=>{var d;let e,f,g,h=(d=a.key,f=(e=["submitted","screening","interview_scheduled","offer_extended"]).indexOf("under_review"===A.status?"screening":"interviewed"===A.status?"interview_scheduled":A.status),g=e.indexOf(d),"rejected"===A.status||"withdrawn"===A.status?0===g?"completed":"inactive":g<f?"completed":g===f?"current":"upcoming");return(0,b.jsxs)("div",{className:`p-4 rounded-2xl border transition-all ${"completed"===h?"bg-emerald-50/60 border-emerald-200/80 text-emerald-950":"current"===h?"bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-sm":"bg-slate-50 border-slate-200/70 text-slate-400"}`,children:[(0,b.jsxs)("div",{className:"flex items-center justify-between mb-2",children:[(0,b.jsxs)("span",{className:`text-xs font-bold ${"completed"===h?"text-emerald-700":"current"===h?"text-indigo-700":"text-slate-400"}`,children:["Stage ",c+1]}),"completed"===h?(0,b.jsx)(n.CheckCircle2,{className:"w-4 h-4 text-emerald-600"}):"current"===h?(0,b.jsx)(u,{className:"w-4 h-4 text-indigo-600 animate-pulse"}):(0,b.jsx)("div",{className:"w-4 h-4 rounded-full border border-slate-300"})]}),(0,b.jsx)("p",{className:`text-sm font-bold ${"completed"===h?"text-emerald-900":"current"===h?"text-indigo-950":"text-slate-600"}`,children:a.label}),(0,b.jsx)("p",{className:"text-xs text-slate-500 mt-0.5",children:a.desc})]},a.key)})})]})]}),(0,b.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-8",children:[(0,b.jsxs)("div",{className:"lg:col-span-2 space-y-6",children:[(0,b.jsxs)(f.Card,{className:"p-6 border-slate-200/80 shadow-sm",children:[(0,b.jsxs)("h3",{className:"text-base font-bold text-slate-900 mb-4 flex items-center gap-2",children:[(0,b.jsx)(p.FileText,{className:"w-5 h-5 text-indigo-600"}),"Cover Letter"]}),A.cover_letter?(0,b.jsx)("div",{className:"text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 font-normal",children:A.cover_letter}):(0,b.jsx)("p",{className:"text-sm text-slate-400 italic",children:"No cover letter submitted for this role."})]}),B.length>0&&(0,b.jsxs)(f.Card,{className:"p-6 border-slate-200/80 shadow-sm",children:[(0,b.jsxs)("h3",{className:"text-base font-bold text-slate-900 mb-4 flex items-center gap-2",children:[(0,b.jsx)(l.Clock,{className:"w-5 h-5 text-indigo-600"}),"Audit & Activity Log"]}),(0,b.jsx)("div",{className:"divide-y divide-slate-100",children:B.map(a=>(0,b.jsxs)("div",{className:"py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("div",{className:"w-2 h-2 rounded-full bg-indigo-500"}),(0,b.jsx)("span",{className:"font-semibold text-slate-800 capitalize",children:a.action.replace("_"," ")})]}),(0,b.jsx)("span",{className:"text-slate-500",children:new Date(a.created_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})})]},a.id))})]})]}),(0,b.jsx)("div",{className:"space-y-6",children:(0,b.jsxs)(f.Card,{className:"p-6 border-slate-200/80 shadow-sm space-y-5",children:[(0,b.jsx)("h3",{className:"text-base font-bold text-slate-900",children:"Submission Assets"}),A.resume_url?(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2",children:"Resume File"}),(0,b.jsxs)("a",{href:A.resume_url.startsWith("http")?A.resume_url:`https://${A.resume_url}`,target:"_blank",rel:"noopener noreferrer",className:"group inline-flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-all",children:[(0,b.jsxs)("span",{className:"flex items-center gap-2",children:[(0,b.jsx)(p.FileText,{className:"w-4 h-4 text-indigo-500"}),"View Resume"]}),(0,b.jsx)(m.ExternalLink,{className:"w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600"})]})]}):(0,b.jsx)("p",{className:"text-xs text-slate-400 italic",children:"No resume URL linked"}),A.portfolio_urls&&A.portfolio_urls.length>0&&(0,b.jsxs)("div",{className:"pt-4 border-t border-slate-100",children:[(0,b.jsx)("span",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2",children:"Portfolios & Profiles"}),(0,b.jsx)("div",{className:"space-y-2",children:A.portfolio_urls.map((a,c)=>(0,b.jsxs)("a",{href:a.startsWith("http")?a:`https://${a}`,target:"_blank",rel:"noopener noreferrer",className:"group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-all",children:[(0,b.jsxs)("span",{className:"flex items-center gap-2 truncate",children:[(0,b.jsx)(s,{className:"w-3.5 h-3.5 text-indigo-400 shrink-0"}),(0,b.jsx)("span",{className:"truncate",children:a})]}),(0,b.jsx)(m.ExternalLink,{className:"w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2"})]},c))})]})]})})]})]})})}],40701)},2046,a=>{"use strict";var b=a.i(16031),c=a.i(64981),d=a.i(6);let e=(0,c.createDatabaseAdapter)({supabaseUrl:d.AppConfig.supabase.url,supabaseKey:d.AppConfig.supabase.anonKey}),f=new class{db;constructor(a){this.db=a}async submitApplication(a){try{if(!a.jobId||!a.candidateProfileId)throw b.AppErrors.validation("Job ID and Candidate Profile ID are required",{context:{jobId:!!a.jobId,candidateProfileId:!!a.candidateProfileId}});let{data:c,error:d}=await this.db.from("applications").insert({job_id:a.jobId,candidate_profile_id:a.candidateProfileId,cover_letter:a.coverLetter||null,resume_url:a.resumeUrl||null,portfolio_urls:a.portfolioUrls||[],answers_to_questions:a.answersToQuestions||{},referral_source:a.referralSource||null,status:"submitted"}).select(`
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
        `).single();if(d)throw b.AppErrors.database("Failed to create scorecard",{cause:d,context:{applicationId:a.applicationId,interviewerId:a.interviewerId}});return c}catch(c){if((0,b.isAppError)(c))throw c;throw b.AppErrors.database("Unexpected error creating scorecard",{cause:c,context:{applicationId:a.applicationId,interviewerId:a.interviewerId}})}}}(e);a.s(["applicationService",0,f])}];

//# sourceMappingURL=_0j2i8qe._.js.map