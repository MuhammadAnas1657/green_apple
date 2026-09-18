const body=document.body;
const header=document.querySelector('.site-header');
const menuToggle=document.getElementById('menuToggle');
const themeToggle=document.getElementById('themeToggle');

if(localStorage.getItem('ga-theme')==='dark'||(!localStorage.getItem('ga-theme')&&matchMedia('(prefers-color-scheme: dark)').matches))body.classList.add('dark');
themeToggle.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('ga-theme',body.classList.contains('dark')?'dark':'light')});
menuToggle.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menuToggle.setAttribute('aria-expanded',String(open))});
header.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{header.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false')}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

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
document.getElementById('bookingForm').addEventListener('submit',event=>{
  event.preventDefault();
  if(!event.currentTarget.reportValidity())return;
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
