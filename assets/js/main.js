'use strict'
document.addEventListener("DOMContentLoaded", initial);

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
	
	//Рендерим пагинацию
	pagintionRender();

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

	let selectPage = false;

	function swiperMove(pos) {

		if(pos) {
			targetPage = pos;
			bar.style.top = `-${pos * 100}%`;
			pagintionRender()
			return
		}
		if(selectPage === false){
			selectPage = true;
			setTimeout(()=> selectPage = false,1000)
			pagintionRender()
			bar.style.top = `-${targetPage * 100}%`;			
		}
	}

	function scrollMove (e) {
		e = e || window.event;
		let delta = e.deltaY || e.detail || e.wheelDelta;
		e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		if(delta > 0 && targetPage + 1 < pages && selectPage === false){
			targetPage++;
			swiperMove();
			return
		}
		if(delta < 0 && targetPage != 0 && selectPage === false){
			targetPage--;
			swiperMove();
			return
		}
	}
}