const START = new Date("2026-03-16")
const TOTAL = 75

let data = JSON.parse(localStorage.getItem("challenge")) || {}

function dayNumber(date){

return Math.floor((date-START)/(1000*60*60*24))+1

}

let today = new Date()

let day = dayNumber(today)

if(day<1) day=1
if(day>TOTAL) day=TOTAL

let date = new Date(START)
date.setDate(START.getDate()+day-1)

todayLabel.innerText="Day "+day+" • "+date.toDateString()

function save(){

localStorage.setItem("challenge",JSON.stringify(data))

renderCalendar()
updateProgress()

}

function updateToday(){

if(!data[day]) data[day]={}

data[day].diet=diet.checked
data[day].water=water.checked
data[day].exercise=exercise.checked
data[day].word=word.checked
data[day].photoCheck=photoCheck.checked

save()

}

document.querySelectorAll("input[type=checkbox]").forEach(c=>{
c.addEventListener("change",updateToday)
})

photoUpload.addEventListener("change",function(){

let file=this.files[0]

let reader=new FileReader()

reader.onload=function(){

if(!data[day]) data[day]={}

data[day].photo=reader.result
data[day].photoCheck=true

save()

}

reader.readAsDataURL(file)

})

function renderCalendar(){

calendar.innerHTML=""

for(let i=1;i<=TOTAL;i++){

let d=data[i]||{}

let div=document.createElement("div")
div.className="day"

let date = new Date(START)
date.setDate(START.getDate()+i-1)

div.innerHTML=date.getDate()

let complete=d.diet && d.water && d.exercise && d.word && d.photoCheck

if(complete) div.classList.add("complete")

if(d.photo){

let img=document.createElement("img")
img.src=d.photo
div.appendChild(img)

}

calendar.appendChild(div)

}

}

function updateProgress(){

let complete=0
let streak=0

for(let i=1;i<=TOTAL;i++){

let d=data[i]

let done=d && d.diet && d.water && d.exercise && d.word && d.photoCheck

if(done){
complete++
streak++
}else{
streak=0
}

}

progressBar.style.width=(complete/TOTAL)*100+"%"
progressText.innerText=complete+" / 75 Days Complete"
document.getElementById("streak").innerText="Current Streak: "+streak

}

renderCalendar()
updateProgress()