// Approved Ink & Gold editorial illustrations, not footage from Genie.
(() => {
const S=window.NOIR_SCENES, K="#16181A", P="#EFE8DA", G="#D7B54A", R="#D9412B";
const rect=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
function text(x,s,px,py,size=44,c=P){x.fillStyle=c;x.font=`600 ${size}px "Schibsted Grotesk",sans-serif`;x.textAlign="center";x.fillText(s,px,py)}
function base(x){rect(x,-200,-200,1480,2320,K);rect(x,95,620,890,760,"#343635");x.strokeStyle="#827e74";x.lineWidth=3;x.strokeRect(95,620,890,760);text(x,"b",150,130,74,G)}
function room(x,u,drift=false){base(x);x.save();x.translate(540,980);x.strokeStyle=P;x.lineWidth=5;x.beginPath();x.moveTo(-360,260);x.lineTo(0,60);x.lineTo(360,230);x.moveTo(-360,260);x.lineTo(-360,-170);x.lineTo(0,-340);x.lineTo(360,-170);x.lineTo(360,230);x.moveTo(0,-340);x.lineTo(0,60);x.stroke();const shift=drift?Math.sin(u*1.4)*28:0;x.strokeStyle=G;x.lineWidth=8;x.strokeRect(-120+shift,-140,170,280);x.fillStyle=G;x.beginPath();x.arc(20+shift,5,9,0,7);x.fill();x.restore()}
function checklist(x,u,labels){base(x);labels.forEach((l,i)=>{const py=800+i*150;rect(x,175,py-45,55,55,"#53564f");if(u>i*.8){x.strokeStyle=G;x.lineWidth=8;x.beginPath();x.moveTo(185,py-15);x.lineTo(200,py);x.lineTo(225,py-35);x.stroke()}x.textAlign="left";x.fillStyle=P;x.font='500 39px "Schibsted Grotesk",sans-serif';x.fillText(l,265,py)})}
["g-door","g-world","g-editor"].forEach(id=>S[id]=(x,u)=>room(x,u));
S["g-drift"]=(x,u)=>{room(x,u,true);rect(x,150,1260,780,75,R);text(x,"ILLUSTRATION · NOT GENIE OUTPUT",540,1310,28)};
S["g-check"]=(x,u)=>checklist(x,u,["Real place?","Reliable record?","Source checked?"]);
S["g-close"]=(x,u)=>checklist(x,u,["Sources named","Limits explained","Human decision"]);
S["w-desk"]=(x,u)=>{base(x);rect(x,180,1090,720,35,P);rect(x,220,1125,22,230,"#8d8b84");rect(x,838,1125,22,230,"#8d8b84");rect(x,370,790,340,260,"#d2cbbc");for(let i=0;i<4;i++)rect(x,410,850+i*45,210,8,"#53564f");text(x,"THE HUMAN QUESTION",540,735,34,G)};
S["w-count"]=(x,u)=>{base(x);text(x,"43%",540,990,210,G);text(x,"SAID THEY USED AI AT WORK",540,1115,35);text(x,"1,015 QUEBEC WORKERS SURVEYED",540,1250,29)};
S["w-tasks"]=(x,u)=>{base(x);for(let i=0;i<12;i++)rect(x,215+(i%4)*165,790+Math.floor(i/4)*160,110,110,i<3?G:"#77786d");text(x,"LESS THAN A QUARTER OF TASKS",540,1320,29)};
S["w-voice"]=(x,u)=>checklist(x,u,["Privacy","Working conditions","A say in decisions"]);
S["w-limit"]=(x,u)=>{base(x);text(x,"A SNAPSHOT",540,960,77,G);text(x,"OF THIS SURVEY GROUP",540,1050,40);text(x,"NOT A PREDICTION FOR EVERY JOB",540,1240,30)};
S["w-close"]=(x,u)=>checklist(x,u,["Training","Accountability","Human oversight"]);
})();
