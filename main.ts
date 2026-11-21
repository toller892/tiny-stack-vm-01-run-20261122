import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const T:Record<number,number[]>={
0:[0,0,0],1:[1,0,1],2:[4,0,1],3:[0,1,0],4:[0,1,2],5:[0,2,2],6:[0,2,3],7:[0,3,3],
16:[0,2,1],17:[0,2,1],18:[0,2,1],19:[0,2,1],20:[0,2,1],21:[0,2,1],22:[0,2,1],
23:[0,1,1],24:[0,2,1],25:[0,2,1],26:[0,2,1],27:[0,1,1],28:[0,2,1],29:[0,2,1],
30:[0,2,1],32:[0,2,1],33:[0,2,1],34:[0,2,1],48:[2,0,0],49:[2,1,0],50:[2,1,0],
51:[2,0,0],52:[0,0,0],64:[0,1,1],65:[0,2,0],80:[0,1,0],81:[0,1,0],82:[0,0,1],83:[0,1,0]};
const enc=new TextEncoder();
function run(p:Uint8Array,q:Uint8Array){
  const n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
  let sp=0,cp=0,ol=0,ip=0,pc=0,st=0;
  const done=(e:number)=>({o:o.slice(0,ol),e});
  for(;;){
    if(st===1e6)return done(10);
    if(pc<0||pc>=n)return done(9);
    const b=p[pc],t=T[b];
    if(!t)return done(5);
    const im=t[0],po=t[1],pu=t[2];
    if(pc+im>=n)return done(9);
    st++;
    const nx=pc+1+im;
    if(sp<po)return done(2);
    if(sp-po+pu>256)return done(3);
    pc=nx;
    if(b>=16&&b<=34&&b!==23&&b!==27){
      const y=D[sp-1],x=D[sp-2];
      let r=0;
      if(b===16)r=(x+y)|0;
      else if(b===17)r=(x-y)|0;
      else if(b===18)r=Math.imul(x,y);
      else if(b===19){if(y===0)return done(4);r=x===-2147483648&&y===-1?x:(x/y)|0;}
      else if(b===20){if(y===0)return done(4);r=y===-1?0:(x%y)|0;}
      else if(b===21){if(y===0)return done(4);r=Math.floor((x>>>0)/(y>>>0))|0;}
      else if(b===22){if(y===0)return done(4);r=((x>>>0)%(y>>>0))|0;}
      else if(b===24)r=x&y;
      else if(b===25)r=x|y;
      else if(b===26)r=x^y;
      else if(b===28)r=x<<(y&31);
      else if(b===29)r=x>>(y&31);
      else if(b===30)r=(x>>>(y&31))|0;
      else if(b===32)r=x===y?1:0;
      else if(b===33)r=x<y?1:0;
      else if(b===34)r=(x>>>0)<(y>>>0)?1:0;
      sp-=2;D[sp++]=r;
      continue;
    }
    switch(b){
      case 0:return done(0);
      case 1:D[sp++]=(p[nx-1]<<24)>>24;break;
      case 2:D[sp++]=p[nx-4]|(p[nx-3]<<8)|(p[nx-2]<<16)|(p[nx-1]<<24);break;
      case 3:sp--;break;
      case 4:D[sp]=D[sp-1];sp++;break;
      case 5:{const w=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=w;break;}
      case 6:D[sp]=D[sp-2];sp++;break;
      case 7:{const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break;}
      case 23:D[sp-1]=(-D[sp-1])|0;break;
      case 27:D[sp-1]=~D[sp-1];break;
      case 48:case 49:case 50:{
        const rel=((p[nx-2]|(p[nx-1]<<8))<<16)>>16;
        let take=true;
        if(b!==48){const v=D[--sp];take=b===49?v===0:v!==0;}
        if(take)pc=nx+rel;
        break;
      }
      case 51:
        if(cp===64)return done(7);
        C[cp++]=nx;
        pc=p[nx-2]|(p[nx-1]<<8);
        break;
      case 52:
        if(cp===0)return done(8);
        pc=C[--cp];
        break;
      case 64:{const a=D[sp-1];if(a<0||a>=256)return done(6);D[sp-1]=M[a];break;}
      case 65:{const a=D[sp-1],v=D[sp-2];if(a<0||a>=256)return done(6);sp-=2;M[a]=v;break;}
      case 80:{const by=enc.encode(String(D[sp-1]));if(ol+by.length>65536)return done(11);sp--;o.set(by,ol);ol+=by.length;break;}
      case 81:if(ol+1>65536)return done(11);o[ol++]=D[--sp]&255;break;
      case 82:D[sp++]=ip<q.length?q[ip++]:-1;break;
      case 83:return done(D[--sp]&255);
    }
  }
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
  const r=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
  mkdirSync(join(O,id),{recursive:true});
  writeFileSync(join(O,id,'stdout.bin'),r.o);
  writeFileSync(join(O,id,'exit.txt'),`${r.e}\n`);
}
