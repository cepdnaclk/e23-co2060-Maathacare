document.addEventListener('DOMContentLoaded',()=>{
  const button=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#main-nav');
  if(button&&nav){button.addEventListener('click',()=>{
    const isOpen=nav.classList.toggle('open');
    button.setAttribute('aria-expanded',String(isOpen));
  });}
  const here=window.location.pathname.replace(/\/+$/,'/') || '/';
  document.querySelectorAll('.nav a').forEach(a=>{
    const path=new URL(a.href).pathname.replace(/\/+$/,'/');
    if(path===here){a.classList.add('active');a.setAttribute('aria-current','page');}
  });
});
