const body=document.body;
const header=document.querySelector('.site-header');
const menuToggle=document.getElementById('menuToggle');
const themeToggle=document.getElementById('themeToggle');

if(localStorage.getItem('ga-theme')==='dark'||(!localStorage.getItem('ga-theme')&&matchMedia('(prefers-color-scheme: dark)').matches))body.classList.add('dark');
themeToggle.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('ga-theme',body.classList.contains('dark')?'dark':'light')});
menuToggle.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menuToggle.setAttribute('aria-expanded',String(open))});
header.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{header.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false')}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible')}else{entry.target.classList.remove('visible')}}),{threshold:0.01,rootMargin:'0px 0px 100px 0px'});
document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));

function updateHScrollHeights() {
  document.querySelectorAll('.h-scroll-wrapper').forEach(wrapper => {
    const track = wrapper.querySelector('.h-scroll-track');
    if (!track) return;
    const windowHeight = window.innerHeight;
    const maxTranslate = track.scrollWidth - track.parentElement.clientWidth;
    if (maxTranslate > 0) {
      wrapper.style.height = `${windowHeight + Math.round(maxTranslate * 0.85)}px`;
    } else {
      wrapper.style.height = 'auto';
    }
  });
}

window.addEventListener('resize', updateHScrollHeights);
window.addEventListener('load', updateHScrollHeights);
document.addEventListener('DOMContentLoaded', updateHScrollHeights);
setTimeout(updateHScrollHeights, 300);

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Horizontal scroll for pinned sections
  document.querySelectorAll('.h-scroll-wrapper').forEach(wrapper => {
    const track = wrapper.querySelector('.h-scroll-track');
    if (!track) return;
    
    const rect = wrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const totalScroll = rect.height - windowHeight;
    if (totalScroll <= 0) return;

    let progress = -rect.top / totalScroll;
    progress = Math.max(0, Math.min(1, progress));
    
    const maxTranslate = track.scrollWidth - track.parentElement.clientWidth;
    if (maxTranslate > 0) {
      track.style.transform = `translate3d(-${progress * maxTranslate}px, 0, 0)`;
    }
  });
});

const heroSlides=[...document.querySelectorAll('.hero-slide')];
const heroMessages=[...document.querySelectorAll('.hero-message')];
const heroDots=[...document.querySelectorAll('.hero-dot')];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let heroIndex=0,heroTimer=null,heroPaused=reduceMotion.matches;
function showHero(index){
  heroIndex=(index+heroSlides.length)%heroSlides.length;
  heroSlides.forEach((slide,i)=>{const active=i===heroIndex;slide.classList.toggle('active',active);slide.setAttribute('aria-hidden',String(!active))});
  heroMessages.forEach((message,i)=>{const active=i===heroIndex;message.classList.toggle('active',active);message.setAttribute('aria-hidden',String(!active))});
  heroDots.forEach((dot,i)=>{const active=i===heroIndex;dot.classList.toggle('active',active);dot.setAttribute('aria-pressed',String(active))});
}
function restartHero(){clearInterval(heroTimer);if(!heroPaused)heroTimer=setInterval(()=>showHero(heroIndex+1),3000)}
if(heroDots.length) heroDots.forEach((dot,index)=>dot.addEventListener('click',()=>{showHero(index);restartHero()}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(heroTimer);else restartHero()});
showHero(0);restartHero();

const shell=document.getElementById('panoramaShell');
const panoramaImage=document.getElementById('panoramaImage');
const sceneTitle=document.getElementById('sceneTitle');
const dragDot=document.getElementById('dragDot');
let dragging=false,startX=0,startPos=0,position=0;
function setPan(next){position=((next%2400)+2400)%2400;panoramaImage.style.backgroundPosition=`${position}px center`;dragDot.style.left=`${position%110}px`}
shell.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;dragging=true;startX=event.clientX;startPos=position;shell.setPointerCapture(event.pointerId)});
shell.addEventListener('pointermove',event=>{if(dragging)setPan(startPos+(event.clientX-startX))});
shell.addEventListener('pointerup',()=>dragging=false);shell.addEventListener('pointercancel',()=>dragging=false);
shell.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();setPan(position-80)}if(event.key==='ArrowRight'){event.preventDefault();setPan(position+80)}if(event.key==='Escape')closePanorama()});

document.querySelectorAll('.scene').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.scene').forEach(item=>item.classList.remove('active'));button.classList.add('active');panoramaImage.style.backgroundImage=`url('${button.dataset.image}')`;sceneTitle.textContent=button.dataset.title;setPan(0)}));
const expandButton=document.getElementById('expandPanorama');
const closeButton=document.getElementById('closePanorama');
async function openPanorama(){try{if(shell.requestFullscreen){await shell.requestFullscreen()}else{shell.classList.add('is-expanded');body.style.overflow='hidden'}}catch{shell.classList.add('is-expanded');body.style.overflow='hidden'}shell.focus()}
async function closePanorama(){if(document.fullscreenElement){await document.exitFullscreen()}shell.classList.remove('is-expanded');body.style.overflow=''}
expandButton.addEventListener('click',openPanorama);closeButton.addEventListener('click',closePanorama);document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){shell.classList.remove('is-expanded');body.style.overflow=''}});

const lightbox=document.getElementById('lightbox');
const lightboxImage=document.getElementById('lightboxImage');
const lightboxCaption=document.getElementById('lightboxCaption');
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lightboxImage.src=item.dataset.full;lightboxImage.alt=item.querySelector('img').alt;lightboxCaption.textContent=item.querySelector('span').textContent;lightbox.showModal()}));
document.getElementById('closeLightbox').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close()});

const reelFrames=[...document.querySelectorAll('.reel-frame[data-facebook]')];
function reelEmbedUrl(url){return `https://web.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=false&width=500`}
function loadReel(frame){
  const iframe=frame.querySelector('iframe');
  if(!iframe.src)iframe.src=reelEmbedUrl(frame.dataset.facebook);
}
function startReel(frame){
  loadReel(frame);
  frame.classList.add('is-playing');
}
function stopReel(frame){
  const iframe=frame.querySelector('iframe');
  iframe.removeAttribute('src');
  frame.classList.remove('is-playing');
}
const reelObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  entry.target.dataset.inView=String(entry.isIntersecting);
  if(entry.isIntersecting)loadReel(entry.target);else stopReel(entry.target);
}),{threshold:.42,rootMargin:'0px 0px -8%'});
reelFrames.forEach(frame=>{
  reelObserver.observe(frame);
  frame.addEventListener('pointerenter',()=>loadReel(frame));
  frame.addEventListener('focusin',()=>loadReel(frame));
  frame.querySelector('.reel-play').addEventListener('click',()=>startReel(frame));
  frame.addEventListener('pointerleave',()=>{if(frame.dataset.inView!=='true')stopReel(frame)});
});

const dateInput=document.getElementById('date');
dateInput.min=new Date().toISOString().split('T')[0];
const occasionSelect=document.getElementById('occasionSelect');
const occasionInput=document.getElementById('occasion');
const occasionTrigger=document.getElementById('occasionTrigger');
const occasionValue=document.getElementById('occasionValue');
const occasionMenu=document.getElementById('occasionMenu');
const occasionOptions=[...occasionMenu.querySelectorAll('[role="option"]')];
const occasionField=occasionSelect.closest('.select-field');
const occasionError=document.getElementById('occasionError');
function setOccasionOpen(open){occasionMenu.hidden=!open;occasionTrigger.setAttribute('aria-expanded',String(open));if(open)(occasionOptions.find(option=>option.getAttribute('aria-selected')==='true')||occasionOptions[0]).focus()}
occasionTrigger.addEventListener('click',()=>setOccasionOpen(occasionMenu.hidden));
occasionTrigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='Enter'||event.key===' '){event.preventDefault();setOccasionOpen(true)}});
occasionOptions.forEach((option,index)=>{
  option.addEventListener('click',()=>{occasionInput.value=option.dataset.value;occasionValue.textContent=option.textContent;occasionOptions.forEach(item=>item.setAttribute('aria-selected',String(item===option)));occasionField.classList.remove('is-invalid');occasionTrigger.removeAttribute('aria-invalid');occasionError.hidden=true;setOccasionOpen(false);occasionTrigger.focus()});
  option.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();occasionOptions[(index+(event.key==='ArrowDown'?1:-1)+occasionOptions.length)%occasionOptions.length].focus()}if(event.key==='Escape'){setOccasionOpen(false);occasionTrigger.focus()}});
});
document.addEventListener('pointerdown',event=>{if(!occasionSelect.contains(event.target)&&!occasionMenu.hidden)setOccasionOpen(false)});
document.getElementById('bookingForm').addEventListener('submit',event=>{
  event.preventDefault();
  if(!event.currentTarget.reportValidity())return;
  if(!occasionInput.value){occasionField.classList.add('is-invalid');occasionTrigger.setAttribute('aria-invalid','true');occasionError.hidden=false;occasionTrigger.focus();return}
  const data=new FormData(event.currentTarget);
  const dateValue=new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('en-PK',{day:'numeric',month:'long',year:'numeric'});
  const message=[
    'Hello Green Apple Farm House,',
    '',
    'I would like to make an enquiry:',
    `• Name: ${data.get('name')}`,
    `• Phone: ${data.get('phone')}`,
    `• Experience: ${data.get('occasion')}`,
    `• Preferred date: ${dateValue}`,
    `• Number of guests: ${data.get('guests')}`,
    data.get('message')?`• Additional details: ${data.get('message')}`:'',
    '',
    'Please share availability and booking details. Thank you.'
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/923046000028?text=${encodeURIComponent(message)}`,'_blank','noopener');
});
