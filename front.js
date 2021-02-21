//Количество дней. Заведомо знаем что их 14,
//поэтому можно прописать и не брать из локалки
const _COUNT_DAYS = 14;


(function init(){

    const arrowLeft = document.querySelector('#arrow-left'),
         arrowRight = document.querySelector('#arrow-right'),
           conveyor = document.querySelector('#conveyor')

    arrowLeft.onclick = () => changeDay('minus')
    arrowRight.onclick = () => changeDay('plus')

})();


function changeDay(action){

    const stateTrans = +conveyor.style.transform.match(/\(([-0-9]{1,})/, '')[1],
            withWind = conveyor.offsetWidth,
           maxBorder = _COUNT_DAYS * withWind

    if(
        (stateTrans === 0 && action === 'minus')
        ||
        (Math.abs(stateTrans - withWind) === maxBorder
        && 
        action === 'plus')

       ){
        return false
    }


    if(action === 'minus'){

        action = stateTrans + withWind
    }else{
        action = stateTrans - withWind
    }


    conveyor.style.transform = `translate(${action}px, 0)`

}
