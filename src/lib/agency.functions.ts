import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';

export const agencyAction=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((input)=>z.discriminatedUnion('action',[
  z.object({action:z.literal('create'),name:z.string().trim().min(2).max(160)}),
  z.object({action:z.literal('case'),agencyId:z.string().uuid()}),
  z.object({action:z.literal('accept'),invitationId:z.string().uuid()}),
  z.object({action:z.literal('invite'),agencyId:z.string().uuid(),email:z.string().email(),role:z.enum(['agency_admin','agency_staff','professional','clinic_staff','intended_parent','carrier','case_manager']),caseId:z.string().uuid().optional(),permissions:z.array(z.enum(['general','documents','appointments','messages','medical','legal','finance','incidents','audit']))}),
  z.object({action:z.literal('revoke'),agencyId:z.string().uuid(),entityId:z.string().uuid(),kind:z.enum(['member','participant','invitation'])}),
  z.object({action:z.literal('plan'),agencyId:z.string().uuid(),plan:z.enum(['starter','professional','growth','enterprise'])}),
]).parse(input)).handler(async({data,context})=>{
  const db=context.supabase;
  const result=data.action==='create'?await db.rpc('create_agency',{_name:data.name}):data.action==='case'?await db.rpc('create_agency_case',{_agency:data.agencyId}):data.action==='accept'?await db.rpc('accept_agency_invitation',{_invitation:data.invitationId}):data.action==='invite'?await db.rpc('invite_agency_member',{_agency:data.agencyId,_email:data.email,_role:data.role,_case:data.caseId,_permissions:data.permissions}):data.action==='revoke'?await db.rpc('manage_agency_access',{_agency:data.agencyId,_entity:data.entityId,_kind:data.kind}):await db.rpc('record_subscription_plan',{_agency:data.agencyId,_plan:data.plan});
  if(result.error)throw new Error(result.error.message);
  return {id:typeof result.data==='string'?result.data:null};
});

export const agencyData=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const db=context.supabase;
  const [agencies,members,invitations,subscriptions,tasks,incidents,audit,credentials]=await Promise.all([db.from('agencies').select('*'),db.from('agency_members').select('*').eq('active',true),db.from('agency_invitations').select('*').eq('status','pending'),db.from('subscriptions').select('*'),db.from('case_tasks').select('*'),db.from('incidents').select('*'),db.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(100),db.from('professional_credentials').select('*')]);
  for(const r of [agencies,members,invitations,subscriptions,tasks,incidents,audit,credentials])if(r.error)throw new Error('Could not load your workspace. Please try again.');
  return {agencies:agencies.data??[],members:members.data??[],invitations:invitations.data??[],subscriptions:subscriptions.data??[],tasks:tasks.data??[],incidents:incidents.data??[],audit:audit.data??[],credentials:credentials.data??[]};
});