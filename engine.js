//ОЧЕНЬ ВАЖНОЕ ЗАМЕЧАНИЕ!!! Если вы понижаете дату, то тут программа слетает с условий, и начинает
//прибавлять к периоду не определенный срок, и чтобы дойти до указанной даты, нужно обновлять страницу
//не определенное кол-во раз. Если такое произошло, то просто снесите кэш и обновите страницу.
//Баг только в рамках теста, и ТОЛЬКО при снижении, так как в реальной жизни, даты не снижаются =)


//указываем желаемую дату, которая будет взята за основу сегодняшнего дня (для теста)
//чтобы взять за основу сегодняшнюю дату, то оставляем пустую строку
//гг-мм-дд, чч:мм:сс

//live
const myDate = '',
      myTime = '10:00:00'

//ваше условие
// const myDate = '2012-12-05',
//       myTime = '10:00:00'

//Максимум билетов на один сеанс 10
const _MAX_TICKETS = 10;


//период в днях, от которого будет идти история
//если сегодня 30 число, то при значении 10, отчет всего периода будет идти с 20 числа
//т.е при каждом обновлении страницы будет происходить апдейт + 7 дней
//до сегодняшнего дня. Используется для теста. Больше 20 не имеет смысла
//по умолчанию значение 7. одна неделя
const _BEFORE_DAYS = 7



const _NOW_DATE = Date.parse(`${myDate}T${myTime}`) || Date.now();

(function init(){

    let workCache = localStorage.getItem("cache"),
        workWeek  = []

    workCache = JSON.parse(workCache)

    if(!workCache){

        //первый запуск, если не существует данных в локалке
        workWeek = fillArrayByPattern()
        
        workCache = JSON.stringify(workWeek)
        localStorage.setItem("cache", workCache)

        init()

    }else{

        //важно! сначала обновить
        updateLocal(init)

        aggregateCardsForPage()
    }


})();


function aggregateCardsForPage(){

    const area = document.querySelector('#conveyor'),
          DATE = new Date(_NOW_DATE).getDate()

    let workCache = localStorage.getItem("cache")
        workCache = JSON.parse(workCache),
        accessDay = '',
        accessSess = ''
    

    const result = workCache.map((day, index) => {


        if(
            (DATE > day[0].day && index < 7 || DATE < day[0].day && index < 7)
            ||
            (DATE < day[0].day && index > 14)
        ){

                accessDay = 'passed'
            }else{
                accessDay = ''
            }

        return `<div class="wrapperDay">
                    <div id="present_date_title" class="present-date">Дата ${day[0].fullDate}</div>
                        <div id="oneDay" id_date="${day[0].date}" class="sessions-one-day ${accessDay}">

                            ${day.map(sess => {

                                if(sess.tickets.length === _MAX_TICKETS) accessSess = 'passed'
                                    else accessSess = ''

                                return `<div id="hour" class="hour ${accessSess}">
                                            ${sess.hour}
                                        </div>`
                                        
                            }).join(' ')}

                    </div>
                </div>`
    }).join(' ')

    area.innerHTML = result

    addListener()
}


function addListener(){

    const allDay = document.querySelectorAll('#oneDay')
    let session  = []


    allDay.forEach(day => {
        session = day.querySelectorAll('#hour')

        session.forEach(time => {
            time.addEventListener('click', addNewTicket)
            time.addEventListener('mouseover', seeTableTickets)
            time.addEventListener('mouseout', closeTableTickets)
        })
    })

}

function seeTableTickets(e){

    const popup = document.querySelector('#popup'),
           DATE = +this.parentNode.getAttribute('id_date'),
           HOUR = +this.innerText,
              x = e.pageX,
              y = e.pageY

    let workCache = localStorage.getItem("cache"),
        tickets   = []
        workCache = JSON.parse(workCache)

    popup.style = `
        left: ${x}px; 
        top: ${y}px; 
        opacity: 1;
        width: 200px;
        padding: 10px;
    `
    workCache.forEach(day => {

        day.find(sess => {
            if(sess.date === DATE && sess.hour === HOUR){
                tickets = sess.tickets
                return true
            }
        })
    })

    if(tickets.length){
        popup.innerHTML = `
            <h4>Билетов ${tickets.length}/${_MAX_TICKETS}</h4>
            ${tickets.join(' ')}
        `
    }else{
        popup.innerHTML = 'На этот сеанс, еще никто не купил билетов.'
    }


}

function closeTableTickets(){

    const popup = document.querySelector('#popup')
    popup.removeAttribute('style')
    popup.innerHTML = ''
}


function addNewTicket(){

    const newMember = prompt('Как вас зовут?')
    
    if(!newMember) return false

    const hourTicket = +this.innerText,
          dateTicket = +this.parentNode.getAttribute('id_date'),
          DATE       = _NOW_DATE,
          NOW_HOUR   = new Date(DATE).getHours(),
          NOW_DAY    = new Date(DATE).getDate()

    let workCache  = localStorage.getItem("cache"),
        tickets    = [],
        findMember = '',
        sessIndex  = 0

    workCache = JSON.parse(workCache)


    workCache.forEach((day, dayIndex) => {

        sessIndex = 0

        for(let sess of day){

            tickets    = sess.tickets
            findMember = tickets.find(member => member === newMember)

            if(dateTicket === sess.date && hourTicket === sess.hour){

                if(tickets.length !== _MAX_TICKETS){


                    console.log(NOW_HOUR)

                    if(
                        (NOW_DAY === sess.day && NOW_HOUR < sess.hour)
                        ||
                        ((NOW_DAY < sess.day || NOW_DAY > sess.day) && DATE < sess.date)
                    ){

                        if(findMember){
                            alert('Вы уже купили билет на этот сеанс!')
                            break
                        }

                        workCache[dayIndex][sessIndex] = {
                            ...sess, 
                            tickets: [
                                ...tickets,
                                newMember
                            ]
                        }
                        
                        alert('Билет приобретен!')

                        //живая метка того, что сеанс заполнился после продажи 10-го билета
                        //с задержкой. Так как новые данные не успевают попасть в функцию
                        if(tickets.length + 1 === _MAX_TICKETS){
                            setTimeout(aggregateCardsForPage, 100)
                        }

                    }else{
                        alert('Бронирование билетов не доступно на этот сеанс!')
                    }

                }else if(tickets.length === _MAX_TICKETS){

                    alert('Уже продано максимальное количество билетов!')
                }


            }
            sessIndex++
        }
        
    })

    workCache = JSON.stringify(workCache)
    localStorage.setItem("cache", workCache)
}


function updateLocal(init){

    const DATE = _NOW_DATE,
       NOW_DAY = new Date(DATE).getDate(),
       HOURS24 = 86400000

    let workCache = localStorage.getItem("cache"),
        workedOut = [],
        posOldDay = null,
        workWeek  = {}

    workCache = JSON.parse(workCache)


    workCache.forEach((day, index) => {
        if(day[0].day === NOW_DAY && day[0].date > DATE - HOURS24 * 7){

            posOldDay = index
        }
    })


    //забираем отработанные дни с действующего периода - после 7-го индекса
    workCache.forEach((day, index)=> {

        for(let sess of day){
            
            if(index >= 7 && posOldDay !== 7 && posOldDay !== null){

                workedOut.push(day)
                posOldDay--

            }
            break
        }
    })

    if(posOldDay === null){
        
        delete localStorage.cache
        init()
        // setTimeout(init, 100)
    }


    const countOldDays = workedOut.length

    //смещаем индексы и добавляем новые элементы в конце
    if(countOldDays >= 1){

        //забираем последнюю дату из основного массива объектов
        //для дальнейшего смещения
        const lastDate = workCache[workCache.length - 1][0].date

        const newDays = fillArrayByPattern(countOldDays, lastDate)

        workCache.push(...newDays)
        workCache.splice(0, countOldDays)

        workCache = JSON.stringify(workCache)
        localStorage.setItem("cache", workCache)
        
    }
   
}


function fillArrayByPattern(quantity = 14, lastDate = null){

    const INIT_START_HOUR = 10,
          HOURS24 = 86400000,
          DATE = lastDate || _NOW_DATE


    let daySess  = [],
        sessHour = 0,
        twoHour  = 0,
        nextDay  = 0,
        sessDate = 0


    const week = new Array(quantity).fill().map((day, indexDay) => {

        twoHour = 0
        nextDay = HOURS24 * indexDay
        

        if(lastDate){
            sessDate = DATE + HOURS24 + nextDay
        }else{
            sessDate = DATE - HOURS24 * _BEFORE_DAYS + nextDay   
        }
        
        daySess = new Array(6).fill().map(sess => {

            sessHour = INIT_START_HOUR + twoHour
            twoHour = twoHour + 2

            //получение рандомных имен для заполнения прошлых сеансов
            let names = ['vasya', 'misha', 'kolya'],
              randNum = Math.round(Math.random() * 4)
                
              if(names[randNum]) names = [names[randNum]]
                else names = []

            return {
                fullDate: getDateFromUnix(sessDate),
                date: sessDate,
                hour: sessHour,
                tickets: names,
                day: new Date(sessDate).getDate()
            }

        })
        return daySess
    
    })

    return week

}



function getDateFromUnix(UNIX_timestamp){

    const outSide = Number(UNIX_timestamp)

    let a = new Date(outSide),
    year  = a.getFullYear(),
    month = a.getMonth() + 1
        if(month < 10) month = '0'+month

    let day = a.getDate()
    if(day < 10) day = '0'+day


    return `${day}.${month}.${year}`
}

