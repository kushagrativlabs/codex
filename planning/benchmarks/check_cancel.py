"""Probe HTTP stream closure and service recovery; does not prove engine cancellation."""
import json,pathlib,time,urllib.request
path=pathlib.Path('planning/benchmarks/phase0-cancellation.json')
if path.exists(): raise SystemExit('Evidence file exists; preserve it before another run')
base='http://127.0.0.1:11434'
def request(route,payload=None):
 return urllib.request.urlopen(urllib.request.Request(base+route,data=None if payload is None else json.dumps(payload).encode(),headers={'Content-Type':'application/json'}),timeout=30)
with request('/api/ps') as r: before=json.load(r)
start=time.monotonic()
response=request('/api/chat',{'model':'qwen3.5:0.8b','messages':[{'role':'user','content':'List the integers from 1 to 1000, each on its own line.'}],'think':False,'stream':True,'options':{'num_ctx':2048,'num_predict':2048},'keep_alive':'1m'})
chunks=0; closed_early=False
for line in response:
 item=json.loads(line)
 if item.get('message',{}).get('content'):
  chunks+=1
 if item.get('done'): break
 if chunks>=8:
  closed_early=True; break
close_start=time.monotonic();response.close();close_seconds=time.monotonic()-close_start
probe_start=time.monotonic()
with request('/api/chat',{'model':'qwen3.5:0.8b','messages':[{'role':'user','content':'Reply with OK only.'}],'think':False,'stream':False,'options':{'num_ctx':2048,'num_predict':8},'keep_alive':'1m'}) as r: probe=json.load(r)
result={'model':'qwen3.5:0.8b','preexisting_loaded_models':before,'closed_before_done':closed_early,'received_content_chunks':chunks,'stream_close_seconds':close_seconds,'followup_seconds':time.monotonic()-probe_start,'followup_content':probe.get('message',{}).get('content'),'followup_done_reason':probe.get('done_reason'),'limitation':'Client stream closure and subsequent service response only. No engine telemetry or process-level cancellation assertion.'}
path.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True)
