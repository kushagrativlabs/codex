import argparse,json,time,urllib.request,subprocess,pathlib
parser=argparse.ArgumentParser()
parser.add_argument("--model",default="qwen3:4b")
parser.add_argument("--output",required=True,help="New output file; existing files are not overwritten")
args=parser.parse_args()
output=pathlib.Path(args.output)
if output.exists(): raise SystemExit("Output exists; choose a new path to preserve evidence")
output.parent.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:11434'
def api(path,payload=None):
 data=None if payload is None else json.dumps(payload).encode()
 return json.load(urllib.request.urlopen(urllib.request.Request(BASE+path,data=data,headers={'Content-Type':'application/json'}),timeout=15))
def memory():
 return subprocess.run(['sysctl','vm.swapusage'],capture_output=True,text=True).stdout.strip()
model=args.model
show=api('/api/show',{'model':model})
ps=api('/api/ps')
tests=[('explain', 'In src/math.ts: export const mean = (xs: number[]) => xs.reduce((a,b)=>a+b,0)/xs.length; Explain what happens for an empty array. Mention the file. Answer in at most 60 words.',None),('edit','Return only TypeScript code for export function mean(xs: number[]): number. Return 0 for an empty array; otherwise return the arithmetic mean. Do not import packages.',None),('tool','Read src/math.ts before answering. Use the provided tool. Do not guess file contents.',[{'type':'function','function':{'name':'read_file','description':'Read a project file','parameters':{'type':'object','properties':{'path':{'type':'string'}},'required':['path'],'additionalProperties':False}}}])]
result={'model':model,'model_details':show.get('details'),'capabilities':show.get('capabilities'),'settings':{'num_ctx':2048,'num_predict':160,'temperature':0,'think':False},'preexisting_loaded_models':ps,'swap_before':memory(),'runs':[]}
for name,prompt,tools in tests:
 payload={'model':model,'messages':[{'role':'user','content':prompt}],'stream':True,'think':False,'options':{'num_ctx':2048,'num_predict':160,'temperature':0},'keep_alive':'1m'}
 if tools: payload['tools']=tools
 start=time.monotonic(); first=None; content=''; calls=[]; final={}
 try:
  req=urllib.request.Request(BASE+'/api/chat',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=60) as response:
   for line in response:
    if time.monotonic()-start>90: raise TimeoutError('90 second wall-clock budget exceeded')
    chunk=json.loads(line); msg=chunk.get('message',{})
    if first is None and (msg.get('content') or msg.get('tool_calls')): first=time.monotonic()-start
    content+=msg.get('content',''); calls+=msg.get('tool_calls',[])
    if chunk.get('done'): final=chunk
  row={'test':name,'seconds':round(time.monotonic()-start,3),'first_output_seconds':first,'content':content,'tool_calls':calls,'done_reason':final.get('done_reason'),'eval_count':final.get('eval_count'),'eval_duration_ns':final.get('eval_duration'),'load_duration_ns':final.get('load_duration')}
 except Exception as e: row={'test':name,'seconds':round(time.monotonic()-start,3),'error':str(e)}
 result['runs'].append(row)
 print(json.dumps(row),flush=True)
 output.write_text(json.dumps(result,indent=2)+'\n')
result['swap_after']=memory(); result['loaded_after']=api('/api/ps')
output.write_text(json.dumps(result,indent=2)+'\n')
