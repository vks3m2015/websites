const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40));
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

document.getElementById('year').textContent=new Date().getFullYear();

const items=[...document.querySelectorAll('.gallery-item')];
const box=document.getElementById('lightbox');
const img=document.getElementById('lightboxImage');
let current=0;
function showImage(i){current=(i+items.length)%items.length;img.src=items[current].dataset.full;img.alt=items[current].querySelector('img').alt;}
items.forEach((item,i)=>item.addEventListener('click',()=>{showImage(i);box.classList.add('open');box.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}));
function closeBox(){box.classList.remove('open');box.setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.querySelector('.lightbox-close').addEventListener('click',closeBox);
document.querySelector('.lightbox-prev').addEventListener('click',()=>showImage(current-1));
document.querySelector('.lightbox-next').addEventListener('click',()=>showImage(current+1));
box.addEventListener('click',e=>{if(e.target===box)closeBox()});
document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')closeBox();if(e.key==='ArrowLeft')showImage(current-1);if(e.key==='ArrowRight')showImage(current+1)});

// WhatsApp enquiry form
const form=document.getElementById('enquiryForm');
form.addEventListener('submit',e=>{
  e.preventDefault();
  const d=new FormData(form);
  const text=`Hello Pooja Palace, I would like to enquire about an event.%0A%0AName: ${encodeURIComponent(d.get('name')||'')}%0APhone: ${encodeURIComponent(d.get('phone')||'')}%0AEvent: ${encodeURIComponent(d.get('event')||'')}%0AGuests: ${encodeURIComponent(d.get('guests')||'')}%0ADate: ${encodeURIComponent(d.get('date')||'')}%0AMessage: ${encodeURIComponent(d.get('message')||'')}`;
  window.open(`https://wa.me/919919594100?text=${text}`,'_blank','noopener');
});
