'use strict'
document.body.onload = () => initial();

function initial() {
    //Убираем прелоадер, после загрузки страницы
    let preloader = document.querySelector('.preloader-box');
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 550);

    //Вещаем слушатель на колёсико мыши, так как стандартный scroll тут не доступен
    window.addEventListener('wheel', scrollMove)

    let menuLink = document.querySelectorAll('.menu__link');
    let bar = document.querySelector('.bar');
    let pagination = document.querySelector('.pagination');
    let pages = bar.childElementCount; //Получаем общее количество страниц
    let targetPage = 0; //Целевая страница при каком то событии
    let barPos = 0;

    //Переменная, которая поможет нам уберечь пользователя
    //от лишних поворотов колёсика мыши
    let selectPage = false;

    //Рендерим пагинацию
    pagintionRender();
    //Проверяем ссылки, убираем дефолтное поведение
    switchLink();

    //Проверяем хеш при первом запуске
    checkHash();

    function pagintionRender() {
        pagination.innerHTML = '';
        for (let i = 0; i < pages; i++) {
            //Создаём элемент и сразу вешаем на него слушатель
            let bullet = document.createElement('span');
            bullet.classList.add('pagination__bullet');
            if (i == targetPage) bullet.classList.add('active');
            bullet.dataset.page = i;
            bullet.addEventListener('click', () => {
                swiperMove(bullet.dataset.page);
            })
            //Добавляем в документ
            pagination.appendChild(bullet);
        }
    }

    //Запрещаем выделение на странице
    document.body.onselectstart = function() {
        return false;
    };

    function swiperMove(pos) {
        switchLink();
        //Если функция была вызвана нажатием кнопки
        if (pos) {
        	//Устанавливаем целевую страницу
            targetPage = +pos;
            //Заносим номер страницы в хеш, но так как отсчёт идёт с нуля, прибавляем 1
            addHash(`#page${targetPage+1}`, true)
            switchLink();
            scrollBar();
            barPos = pos * 100;//Умножаем полученый номер страницы на 100
            bar.style.top = `-${barPos}%`;//И двигаем слайдер
            pagintionRender()//Рендерим пагинацию
            return
        }
        //Если функция была вызвана колёсиком,
        //Установим небольшую задержку в 1 секунду
        //Что бы не было скоростных путешествий по странице
        if (selectPage === false) {
            selectPage = true;
            addHash(`#page${targetPage+1}`, true)
            setTimeout(() => selectPage = false, 500)
            pagintionRender()
            barPos = targetPage * 100;
            bar.style.top = `-${barPos}%`;
            return
        }
        //Если функция была вызвана свайпом
        addHash(`#page${targetPage+1}`, true)
        pagintionRender()
        barPos = targetPage * 100;
        bar.style.top = `-${barPos}%`;
    }

    function scrollMove(e) {
        switchLink();
        e = e || window.event;
        let delta = e.deltaY || e.detail || e.wheelDelta;
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
        if (delta > 0 && targetPage + 1 < pages && selectPage === false) {
            targetPage++;
            swiperMove();
            scrollBar();
            return
        }
        if (delta < 0 && targetPage != 0 && selectPage === false) {
            targetPage--;
            swiperMove();
            scrollBar();
            return
        }
    }

    function addHash(selectPage, checkFunc) {
        document.location.hash = selectPage || targetPage;
        if (checkFunc != true) checkHash();
    }

    function checkHash() {
        let hash = document.location.hash.split('#page')[1] - 1;
        if (hash && hash <= pages) {
            targetPage = hash;
            swiperMove()
        } else {
            document.location.hash = '';
            targetPage = 0;
            swiperMove()
        }
        scrollBar()
    }

    function switchLink() {
        for (let i = 0; i < menuLink.length; i++) {
            if (i === targetPage) {
                menuLink[i].classList.add('active');
            } else {
                menuLink[i].classList.remove('active');
            }
        }
    }


    for (let i = 0; i < menuLink.length; i++) {
        menuLink[i].addEventListener('click', (e) => {
            e.preventDefault();
            e = e || window.event;
            addHash(e.target.getAttribute('href'));
        })
    }

    let touchStartPosY;
    let windowSize = document.body.clientHeight;
    let movePos;
    let percent;
    let moveUp = false;
    let mouseDown = false;
    let barPosOld = 0;

    document.body.addEventListener('touchstart', listeners)
    document.body.addEventListener('mousedown', listeners)

    //Следующая функция выглядит достаточно громоздкой
    //Но всё это сделано в угоду работы на мобильных 
    function listeners(e) {
        e = e || window.event;
        //Останавливаем функцию, если touch событие произошло на картинках или табах
        //Можно было бы конечно отключить ванильный Drag and Drop на всех изображениях
        //Но у нас на странице их слишком мало
        if (e.target.nodeName === 'IMG' || e.target === document.querySelector('.tab-container__question')) return;
        barPosOld = barPos;//Заносим текущую позицию слайдера, до начала работы Drag функций
        mouseDown = true;
        touchStart();
        document.body.addEventListener('touchmove', dragSlider)
        document.body.addEventListener('mousemove', dragSlider)
        document.body.addEventListener('touchend', mouseUp)
        document.body.addEventListener('mouseup', mouseUp)

        function mouseUp() {
            document.body.removeEventListener('touchmove', dragSlider)
            document.body.removeEventListener('touchend', mouseUp)
            document.body.removeEventListener('mousemove', dragSlider)
            document.body.removeEventListener('mouseup', mouseUp)
            checkMove();
            percent = 0;
            mouseDown = false;
            document.body.addEventListener('touchcancel', mouseleave)
            document.body.addEventListener('mouseleave', mouseleave)

            function mouseleave() {
                document.body.removeEventListener('touchmove', dragSlider)
                document.body.removeEventListener('touchcancel', mouseleave)
                document.body.removeEventListener('mousemove', dragSlider)
                document.body.removeEventListener('mouseleave', mouseleave)
                if (mouseDown === true) {
                    checkMove();
                    percent = 0;
                    mouseDown = false;
                }
                return;
            }
        }
    }

    //Записываем координаты первого касания в переменную
    function touchStart(e) {
        e = e || window.event;
        touchStartPosY = e.clientY || e.changedTouches[0].screenY;
        movePos = null;
    }

    //Запускаем Drag событие
    function dragSlider(e) {
        e = e || window.event;

        //Координата текущего положения пальца или курсора
        let targetPos = e.clientY || e.changedTouches[0].screenY;

        //Если координата первого касания меньше чем текущее положение курсора
        //Это значит что пользователь листает слайдер вниз
        if (touchStartPosY < targetPos) {
            if (movePos != null && movePos > targetPos) {
                touchStart()
                swipeDown()
                return
            }
            //Если пользователь изменит направление во время движения
            //мы сможем это увидеть
            if (targetPos % 2 === 0) movePos = targetPos;
            swipeUp()
            return
        }

        //Пользователь листает вверх
        if (touchStartPosY > targetPos) {
            if (movePos != null && movePos < targetPos) {
                touchStart()
                swipeUp()
                return
            }
            if (targetPos % 2 === 0) movePos = targetPos;
            swipeDown()
            return
        }
    }

    //Анимация слайдера во время движения курсора по экрану
    function swipeUp(e) {
        e = e || window.event;
        let targetPos = e.clientY || e.changedTouches[0].screenY;
        if (barPos > 0) {//Не позволяем листать выше чем 0
            moveUp = true;

            //Получам в процентном соотношении от экрана координаты первого касания
            let fr = Math.round((touchStartPosY / windowSize) * 100);

            //И текущего положения курсора
            let swipe = Math.round((targetPos / windowSize) * 100);

            //Временная координата положения слайдера
            let prePos = barPos;

            //И двигаем слайдер
            prePos -= (swipe - fr);
            bar.style.top = `-${prePos}%`;
            percent = swipe - fr;//Процент, сколько прошёл курсор по экрану
        }

    }

    function swipeDown(e) {
        e = e || window.event;
        let targetPos = e.clientY || e.changedTouches[0].screenY;

        if (barPos < pages * 100 - 100) {
            moveUp = false;
            let fr = Math.round((touchStartPosY / windowSize) * 100);
            let swipe = Math.round((targetPos / windowSize) * 100);
            let prePos = barPos;
            prePos += (fr - swipe);
            bar.style.top = `-${prePos}%`;
            percent = fr - swipe;
        }
    }

    function checkMove() {
    	//Если курсор прошёл по экрану меньше чем 17% общей высоты,
    	//Останавливаем функцию и возвращаем старое положения слайдера
        if (percent < 17) {
            if (!barPosOld) barPosOld = 0;
            barPos = barPosOld;
            bar.style.top = `-${barPos}%`;
            return
        }

        //Если движение идёт вверх, по процентам всё гуд и мы не на первом слайде
        //Двигаем слайдер на одну страницу вверх
        if (moveUp === true && targetPage > 0) {
            targetPage--;
            scrollBar();
            swiperMove();
            return
        }
        //Тоже самое, но вниз
        if (moveUp === false && targetPage + 1 < pages) {
            targetPage++;
            scrollBar();
            swiperMove();
            return
        }
    }

    function scrollBar() {
        document.querySelector('.scroll-bar').style.width = (targetPage / (pages - 1)) * 100 + '%';
    }

    function listenerQuestion() {
        let resultArea = document.querySelector('.tab-container__result');
        let question = document.querySelectorAll('.question-list__item');
        for (let i = 0; i < question.length; i++) {
            question[i].addEventListener('click', () => {
                resultArea.innerHTML = question[i].dataset.result
            })
        }
    }

    listenerQuestion()

    let questionTab = document.querySelectorAll('.tab-container__question');
    let questionList = document.querySelector('.tab-container__question-list-mobile');
    for (let i = 0; i < questionTab.length; i++) {
        questionTab[i].addEventListener('touchstart', (event) => {
            for (let j = 0; j < questionTab.length; j++) {
                questionTab[j].classList.remove('active');
                questionList.style.left = '40%';
                questionTab[j].style.width = '40%';
                questionTab[j].style.borderRight = '2px solid #1488ff';
            }
            while (questionList.firstChild) {
                questionList.removeChild(questionList.firstChild);
            }
            let clone = event.target.firstElementChild.cloneNode(true);
            questionList.appendChild(clone);
            questionTab[i].classList.add('active');
            listenerQuestion()
        })
    }
}