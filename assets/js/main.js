'use strict'
document.body.onload = ()=> initial();

function initial () {
	//Убираем прелоадер, после загрузки страницы
	let preloader = document.querySelector('.preloader-box');
	preloader.style.opacity = '0';
	setTimeout(()=> preloader.style.display = 'none',550);
	//Вещаем слушатель на колёсико мыши, так как стандартный scroll тут не доступен
	window.addEventListener('wheel',scrollMove)

	let bar = document.querySelector('.bar');
	let pagination = document.querySelector('.pagination');
	let pages = bar.childElementCount;//Получаем общее количество страниц
	let targetPage = 0;//Целевая страница при каком то событии
	let barPos = 0;
	
	//Рендерим пагинацию
	pagintionRender();
	//Проверяем ссылки, убираем дефолтное поведение
	switchLink();

	function pagintionRender(){
		pagination.innerHTML = '';
		for(let i = 0;i< pages;i++){
			//Создаём элемент и сразу вешаем на него слушатель
			let bullet = document.createElement('span');
			bullet.classList.add('pagination__bullet');
			if(i == targetPage) bullet.classList.add('active');
			bullet.dataset.page = i;
			bullet.addEventListener('click',()=>{
				swiperMove(bullet.dataset.page);
			})
			//Добавляем в документ
			pagination.appendChild(bullet);
		}
	}

	//Переменная, которая поможет нам уберечь пользователя
	//от лишних поворотов колёсика мыши
	let selectPage = false;

	function swiperMove(pos) {
		switchLink();
		if(pos) {
			
			targetPage = +pos;
			switchLink();
			scrollBar();
			barPos = pos * 100;
			bar.style.top = `-${barPos}%`;
			pagintionRender()
			return
		}
		//Если функция была вызвана колёсиком,
		//Установим небольшую задержку в 1 секунду
		//Что бы не было скоростных путешествий по странице
		if(selectPage === false){
			selectPage = true;
			setTimeout(()=> selectPage = false,500)
			pagintionRender()
			barPos = targetPage * 100;
			bar.style.top = `-${barPos}%`;			
		}
	}

	function scrollMove (e) {
		switchLink();
		e = e || window.event;
		let delta = e.deltaY || e.detail || e.wheelDelta;
		e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		if(delta > 0 && targetPage + 1 < pages && selectPage === false){
			targetPage++;
			swiperMove();
			scrollBar();
			return
		}
		if(delta < 0 && targetPage != 0 && selectPage === false){
			targetPage--;
			swiperMove();
			scrollBar();
			return
		}
	}

	function switchLink(){
		let menuLink = document.querySelectorAll('.menu__link');
		for(let i = 0;i < menuLink.length;i++){
			if(i === targetPage){
				menuLink[i].classList.add('active');
			}
			else{
				menuLink[i].classList.remove('active');
			}
			menuLink[i].addEventListener('click',(e)=>{
				e = e || window.event;
				e.preventDefault();
				console.log(targetPage);
			})
		}		
	}

	let touchStartPosY;
	let windowSize = document.body.clientHeight;
	let movePos;
	let percent;
	let moveUp = false;
	let mouseDown = false;
	let barPosOld = 0;

	document.body.addEventListener('touchstart',listeners)
	document.body.addEventListener('mousedown',listeners)

	function listeners(){
		barPosOld = barPos;
		mouseDown = true;
		touchStart();
		document.body.addEventListener('touchmove',dragSlider)
		document.body.addEventListener('mousemove',dragSlider)
		document.body.addEventListener('touchend',mouseUp)
		document.body.addEventListener('mouseup',mouseUp)

		function mouseUp(){
			document.body.removeEventListener('touchmove',dragSlider)
			document.body.removeEventListener('touchend',mouseUp)
			document.body.removeEventListener('mousemove',dragSlider)
			document.body.removeEventListener('mouseup',mouseUp)
			checkMove();
			percent = 0;
			mouseDown = false;
			document.body.addEventListener('touchcancel',mouseleave)
			document.body.addEventListener('mouseleave',mouseleave)
			function mouseleave(){
				document.body.removeEventListener('touchmove',dragSlider)
				document.body.removeEventListener('touchcancel',mouseleave)
				document.body.removeEventListener('mousemove',dragSlider)
				document.body.removeEventListener('mouseleave',mouseleave)
				if(mouseDown === true){
					checkMove();
					percent = 0;
					mouseDown = false;					
				}
				return;
			}
		}	
	}

	function touchStart(e){
		e = e || window.event;
		touchStartPosY = e.clientY || e.changedTouches[0].screenY;
		movePos = null;
	}
	function dragSlider(e){
		e = e || window.event;
		let tatgetPos = e.clientY || e.changedTouches[0].screenY;	
		if(touchStartPosY < tatgetPos) {
			if(movePos != null && movePos > tatgetPos) {
				touchStart()
				swipeDown()
				return
			}
			if(tatgetPos % 2 === 0) movePos = tatgetPos;
			swipeUp()
			return
		}
		if(touchStartPosY > tatgetPos) {	
			if(movePos != null && movePos < tatgetPos) {
				touchStart()
				swipeUp()
				return
			}
			if(tatgetPos % 2 === 0) movePos = tatgetPos;
			swipeDown()
			return
		}
	}

	function swipeUp(e){
		e = e || window.event;

		let targetPos = e.clientY || e.changedTouches[0].screenY;
		if(barPos > 0){
			moveUp = true;
			let fr = Math.round((touchStartPosY / windowSize) * 100);
			let swipe = Math.round((targetPos / windowSize) * 100);
			let prePos = barPos;
			prePos -= (swipe -  fr);
			bar.style.top = `-${prePos}%`;
			percent = swipe -  fr;
		}
	}
	function swipeDown(e){
		e = e || window.event;
		let targetPos = e.clientY || e.changedTouches[0].screenY;

		if(barPos < pages * 100 - 100){
			moveUp = false;
			let fr = Math.round((touchStartPosY / windowSize) * 100);
			let swipe = Math.round((targetPos / windowSize) * 100);
			let prePos = barPos;

			prePos +=  (fr - swipe);
			bar.style.top = `-${prePos}%`;
			percent = fr - swipe;
		}
	}

	

	function checkMove() {
		console.log(percent)
		if(percent < 20){
			if(!barPosOld) barPosOld = 0;
			barPos = barPosOld;
			bar.style.top = `-${barPos}%`;
			return
		}
		if(moveUp === true && targetPage > 0){
			if(percent >= 20){
				targetPage--;
				scrollBar();
				swiperMove();
				return	
			}	
		}
		if(moveUp === false && targetPage + 1 < pages){
			if(percent >= 20){
				targetPage++;
				scrollBar();
				swiperMove();
				return
			}		
		}
	}

	function scrollBar(){
		document.querySelector('.scroll-bar').style.width = (targetPage / (pages - 1)) * 100 + '%';
	}	
}