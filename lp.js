(()=>{
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.navlinks');
  if(menu&&nav){
    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    });
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
      nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');
    }));
  }

  const revealItems=document.querySelectorAll('.lp-reveal');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){
    revealItems.forEach(item=>item.classList.add('is-visible'));
  }else{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
    }),{threshold:.12});
    revealItems.forEach(item=>observer.observe(item));
  }

  const modal=document.querySelector('.lp-modal');
  if(!modal)return;
  const pages=[...modal.querySelectorAll('.lp-q')];
  const bar=modal.querySelector('.lp-progress span');
  const form=modal.querySelector('.lp-form');
  const answers={};
  const answerLabels={material:'Tipo de resíduo ou equipamento',volume:'Volume / frequência',equipamento:'Equipamento desejado',periodo:'Período de locação',acondicionamento:'Acondicionamento / acesso'};
  let step=0;
  let returnFocus=null;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const capture=page=>{
    page.querySelectorAll('input[name],select[name],textarea[name]').forEach(field=>{
      const value=field.value.trim();
      if(value)answers[field.name]=value;
    });
    page.querySelectorAll('.qual-choice.selected').forEach(button=>{
      answers[button.dataset.key]=button.dataset.value;
    });
  };
  const summary=()=>{
    const box=modal.querySelector('.lp-summary');
    box.innerHTML=Object.entries(answers).map(([key,value])=>{
      const field=form.querySelector(`[name="${CSS.escape(key)}"]`);
      const label=field?.dataset.label||answerLabels[key]||key.replaceAll('_',' ');
      return `<div><small>${escape(label)}</small><b>${escape(value)}</b></div>`;
    }).join('');
  };
  const show=n=>{
    step=Math.max(0,Math.min(n,pages.length-1));
    pages.forEach((page,index)=>page.classList.toggle('active',index===step));
    bar.style.width=((step+1)/pages.length*100)+'%';
    modal.querySelector('.lp-back').style.visibility=step===0?'hidden':'visible';
    modal.querySelector('.lp-next').textContent=step===pages.length-1?'Abrir WhatsApp':'Continuar →';
    if(step===pages.length-1)summary();
    const heading=pages[step].querySelector('h3');
    heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
  };
  const open=trigger=>{
    resetQualifiedWhatsAppTracking();
    
    Object.keys(answers).forEach(key=>delete answers[key]);
    modal.querySelectorAll('.qual-choice').forEach(button=>button.classList.remove('selected'));
    form.reset();returnFocus=trigger||document.activeElement;
    modal.classList.add('open');document.body.style.overflow='hidden';show(0);
    modal.querySelector('.lp-close').focus({preventScroll:true});
  };
  document.querySelectorAll('[data-open-qual]').forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();open(button);
  }));
  modal.querySelectorAll('.qual-choice').forEach(button=>button.addEventListener('click',()=>{
    const group=button.closest('.qual-grid');
    group.querySelectorAll('.qual-choice').forEach(item=>item.classList.toggle('selected',item===button));
  }));
  const close=()=>{
    modal.classList.remove('open');document.body.style.overflow='';
    returnFocus?.focus?.({preventScroll:true});
  };
  modal.querySelector('.lp-close').addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target===modal)close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('open'))close()});
  modal.querySelector('.lp-back').addEventListener('click',()=>show(step-1));
  modal.querySelector('.lp-next').addEventListener('click',()=>{
    const current=pages[step];
    if(step<pages.length-1){
      for(const group of current.querySelectorAll('.qual-grid[data-required-choice]')){
        if(!current.querySelector(`.qual-choice.selected[data-key="${CSS.escape(group.dataset.requiredChoice)}"]`)){
          group.scrollIntoView({block:'center',behavior:'smooth'});return;
        }
      }
      const required=[...current.querySelectorAll('[required]')];
      const invalid=required.find(field=>!field.reportValidity());
      if(invalid)return;
      capture(current);show(step+1);return;
    }
    const message=[
      `Olá! Gostaria de solicitar uma pré-avaliação de ${document.body.dataset.service} à DMS Ambiental.`,
      ...Object.entries(answers).map(([key,value])=>`${form.querySelector(`[name="${CSS.escape(key)}"]`)?.dataset.label||answerLabels[key]||key}: ${value}`),
      'Enviado pelo site DMS Ambiental.'
    ].join('\n');
    if (!openQualifiedWhatsApp(message)) return;
    
  });
})();
