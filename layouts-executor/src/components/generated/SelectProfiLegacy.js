export function initializeLegacy(){

const seedCandidates=[{id:1,name:'Мария Соколова',exp:'4 года · B2B, CRM Bitrix24, сложные сделки',source:'Ваша база',stage:'shortlist',selected:false},{id:2,name:'Ольга Белова',exp:'7 лет · B2B-продажи, тендеры 44-ФЗ',source:'Отклик',stage:'shortlist',selected:false},{id:3,name:'Игорь Лебедев',exp:'3 года · холодные звонки, дистрибуция',source:'Ваша база',stage:'pool',selected:false},{id:4,name:'Светлана Ким',exp:'5 лет · FMCG, оптовые продажи',source:'Отклик',stage:'pool',selected:false},{id:5,name:'Павел Орехов',exp:'2 года · B2B-продажи сервисов',source:'База платформы',stage:'pool',selected:false}];
const initial=()=>({role:'executor',screen:'project',detailOpen:false,tab:'pool',filter:'all',sort:'deadline',order:{id:'З-1039',title:'Менеджер по продажам B2B',customer:'ООО «Вектор»',requested:1,shortlistCount:3,status:'active',sent:false,version:1},candidates:structuredClone(seedCandidates),history:[{at:'08.11, 18:02',text:'Рекрутер добавил Ольгу Белову в рабочий список кандидатов'},{at:'28.10, 09:10',text:'Назначен исполнитель проекта'}],original:null,replacements:[],increase:null,notifications:['Заказ З-1039 требует вашего действия','В рабочем списке кандидатов 2 из 3 кандидатов'],newOrders:[]});
let s=initial();const $=id=>document.getElementById(id);const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const count=()=>s.candidates.filter(c=>c.stage==='shortlist').length;const selected=()=>s.candidates.filter(c=>c.selected).length;const addHistory=text=>s.history.unshift({at:new Date().toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}),text});const notify=text=>{s.notifications.unshift(text);$('bell-count').textContent=s.notifications.length};let toastTimer;function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3600)}
function modal(title,body,actions){$('modal-title').textContent=title;$('modal-body').innerHTML=body;$('modal-foot').innerHTML=actions||'<button class="btn" onclick="closeModal()">Закрыть</button>';$('modal-back').classList.add('show')};function closeModal(){$('modal-back').classList.remove('show')};function btn(label,action,cls=''){return `<button class="btn ${cls}" onclick="${action}">${label}</button>`};function setRole(role){s.role=role;s.screen='project';s.detailOpen=false;s.tab=role==='executor'?'pool':'shortlist';render()};function navigate(screen,tab){s.screen=screen;s.detailOpen=screen!=='project';if(tab)s.tab=tab;render()};function closeDetail(){s.screen='project';s.activeDraftId=null;s.detailOpen=false;render()};function primaryCreate(){s.role==='customer'?navigate('create'):openAddCandidate()};function resetDemo(){s=initial();render();toast('Демо возвращено в исходное состояние')}
function render(){ensureV3State();const customer=s.role==='customer';$('role-customer').classList.toggle('active',customer);$('role-executor').classList.toggle('active',!customer);$('user-name').textContent=customer?'Владимир Ларин':'Анна Ершова';$('user-role').textContent=customer?'Заказчик · ООО «Вектор»':'Исполнитель · Рекрутер';$('user-ava').textContent=customer?'ВЛ':'АЕ';$('create-btn').innerHTML='<span class="badge-icon">'+(customer?'add_circle':'person_add')+'</span><span class="create-label">'+(customer?'+ Создать заказ':'+ Добавить кандидата')+'</span>';$('panes').classList.toggle('detail-open',!!s.detailOpen);const nav=customer?[['project','Мои заказы','folder_special'],['create','Создать заказ','add_circle'],['shortlist','Списки кандидатов','group'],['messages','Сообщения','chat_bubble_outline'],['history','История','history']]:[['project','Мои проекты','folder_special'],['market','Биржа заказов','travel_explore'],['candidates','Кандидаты','contacts'],['shortlist','Список кандидатов','group'],['messages','Сообщения','chat_bubble_outline'],['history','История','history']];$('nav').innerHTML=nav.map(([k,l,ico])=>`<button class="${s.screen===k||(s.screen==='addCandidate'&&k==='project')?'active':''}" onclick="navigate('${k}')"><span class="badge-icon" title="${l}">${ico}</span><span class="nav-label">${l}</span></button>`).join('');renderList();renderMain();$('bell-count').textContent=s.notifications.length}
function renderList(){const search=($('search')?.value||'').toLowerCase();$('list-title').textContent=s.role==='customer'?'Мои заказы':'Мои проекты в работе';$('filters').innerHTML=[['all','Все'],['active','В работе'],['completed','Выполнены']].map(([k,l])=>`<button class="filter-chip ${s.filter===k?'active':''}" onclick="s.filter='${k}';renderList()">${l}</button>`).join('');let orders=[s.order,...s.newOrders];orders=orders.filter(o=>(s.filter==='all'||(s.filter==='completed'?o.status==='completed':o.status!=='completed'))&&(`${o.title} ${o.id} ${o.customer}`.toLowerCase().includes(search)));if(s.sort==='title')orders.sort((a,b)=>a.title.localeCompare(b.title,'ru'));const status=o=>o.status==='completed'?'Выполнен':o.sent?'Отправлен':`Подготовка ${o.id===s.order.id?count():0}/${o.shortlistCount}`;$('project-list').innerHTML=orders.length?`<div class="project-table-wrap"><table class="project-table"><thead><tr><th>№ заказа</th><th>Проект / вакансия</th><th>Заказчик</th><th>Кандидаты</th><th>Статус</th><th>Срок</th><th></th></tr></thead><tbody>${orders.map(o=>`<tr class="project-tr ${s.detailOpen&&s.screen==='project'&&o.id===s.order.id?'selected':''}" tabindex="0" role="button" onclick="openOrder('${o.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openOrder('${o.id}')}" aria-label="Открыть заказ ${esc(o.id)}"><td class="project-number">${esc(o.id)}</td><td class="project-name">${esc(o.title)}</td><td>${esc(o.customer)}</td><td>${o.requested} из ${o.shortlistCount}</td><td><span class="pill ${o.status==='completed'?'ok':'warn'}">${status(o)}</span></td><td>15.11.2026</td><td class="project-chevron"><span class="badge-icon">chevron_right</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">По вашему запросу заказов нет</div>'}
function openOrder(id){if(id!==s.order.id){const draft=s.newOrders.find(o=>o.id===id);if(!draft)return toast('Заказ не найден');s.activeDraftId=id;s.screen='draft';s.detailOpen=true;render();return;}s.activeDraftId=null;s.screen='project';s.detailOpen=true;render()}
function header(title,subtitle){return `<nav class="project-breadcrumbs" aria-label="Хлебные крошки"><button onclick="closeDetail()">${s.role==='customer'?'Мои заказы':'Мои проекты в работе'}</button><span>›</span><strong>${esc(s.order.id)} · ${esc(s.order.title)}</strong></nav><div class="order-summary"><div><h2>${esc(title)}</h2><div class="small muted" style="margin-top:5px">Заказ № ${esc(s.order.id)} · ${esc(subtitle)}</div></div><span class="pill-status">${s.order.status==='completed'?'✓ Выполнен':s.order.sent?'Список кандидатов отправлен':`Список кандидатов ${count()} из ${s.order.shortlistCount}`}</span></div>`}
function metrics(){return `<div class="grid3"><div class="metric"><span>Нужно выбрать сотрудников</span><b>${s.order.requested}</b></div><div class="metric"><span>Размер списка кандидатов</span><b>${s.order.shortlistCount}</b></div><div class="metric"><span>Выбрано заказчиком</span><b>${selected()} / ${s.order.requested}</b></div></div>`}
function renderMain(){let out='';if(s.screen==='create')out=renderCreate();else if(s.screen==='project')out=renderProject();else if(s.screen==='shortlist')out=renderShortlist();else if(s.screen==='candidates')out=renderCandidates();else if(s.screen==='history')out=renderHistory();else if(s.screen==='messages')out=renderMessages();else if(s.screen==='market')out=renderMarket();else if(s.screen==='draft')out=renderDraftOrder();$('main').innerHTML=out}
function renderProject(){let customer=s.role==='customer';let tabs=customer?[['shortlist','Список кандидатов'],['requirements','Требования вакансии'],['history','История'],['documents','Документы']]:[['pool','Кандидаты и список на выбор'],['requirements','Требования вакансии'],['history','История'],['documents','Документы']];return `<div class="stack" style="gap:17px">${header(s.order.title,customer?'Вы заказчик · ООО «Вектор»':'Вы назначены исполнителем · Заказчик ООО «Вектор»')}<div class="steps-mini"><span>✓ Заказ</span><span>✓ Назначение</span><span class="${!s.order.sent?'active':''}">3. Подготовка</span><span class="${s.order.sent&&s.order.status!=='completed'?'active':''}">4. Отправка и выбор</span><span class="${s.order.status==='completed'?'active':''}">5. Выполнен</span></div>${customer?customerBanner():executorActions()}${metrics()}<div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${s.tab===k?'active':''}" onclick="s.tab='${k}';renderMain()">${l}</button>`).join('')}</div>${s.tab==='pool'?renderPool():s.tab==='shortlist'?renderShortlistContent():s.tab==='history'?renderHistoryContent():s.tab==='documents'?renderDocuments():renderRequirements()}</div>`}
function customerBanner(){return `<div class="callout ${s.order.status==='completed'?'good':'info'}"><strong>${s.order.status==='completed'?'Нужное количество кандидатов выбрано.':s.order.sent?'Исполнитель отправил полный список кандидатов.':'Исполнитель формирует список кандидатов.'}</strong><div class="small muted">${s.order.sent?'Откройте профили и окончательно выберите кандидатов.':'До отправки можно уменьшить размер списка или запросить увеличение с согласия рекрутера.'}</div><div class="rowx wrap" style="margin-top:11px">${!s.order.sent?btn('Изменить размер списка кандидатов','openCountModal()','primary'):btn('Посмотреть кандидатов',"navigate('shortlist')",'primary')}${btn('Написать исполнителю',"navigate('messages')")}</div>${s.increase?`<p class="small" style="margin-top:9px">Запрос увеличения до ${s.increase} кандидатов: <strong>ожидает подтверждения</strong>.</p>`:''}</div>`}
function executorActions(){return `<div class="project-toolbar" aria-label="Быстрые действия">${!s.order.sent?btn('Добавить в рабочий список',"s.tab='pool';renderMain()",'primary'):btn('История состава',"s.tab='history';renderMain()",'primary')}${!s.order.sent?btn('Загрузить резюме','openAddCandidate()'):''}${btn('Написать заказчику',"navigate('messages')")}</div>${s.increase?`<div class="callout info"><strong>Запрос заказчика: увеличить список до ${s.increase} кандидатов</strong><div class="rowx wrap" style="margin-top:10px">${btn('Согласиться','acceptIncrease()','primary')}${btn('Отказать','rejectIncrease()')}</div></div>`:''}`}

function renderPool(){const list=s.candidates.map(c=>`<div class="candidate"><div><div class="name click" onclick="openProfile(${c.id})">${esc(c.name)} <span class="tag ${c.stage==='pool'?'gray':''}">${c.stage==='pool'?'В базе':'В списке на выбор'}</span></div><div class="desc">${esc(c.exp)} · ${esc(c.source)}</div></div><div class="candidate-actions">${btn('Профиль',`openProfile(${c.id})`)}${!s.order.sent?(c.stage==='pool'?btn('В список кандидатов',`addToShortlist(${c.id})`,'primary'):btn('Убрать',`removeFromShortlist(${c.id})`)):(!c.selected&&c.stage==='shortlist'?btn('Заменить',`openReplacement(${c.id})`):'')}</div></div>`).join('');return `<div class="panel"><div class="rowx between"><h3>Кандидаты проекта</h3><span class="tag">${s.candidates.length} всего</span></div><div class="barlabel">Список на выбор: ${count()} из ${s.order.shortlistCount}</div><div class="progress"><div style="width:${Math.min(100,100*count()/s.order.shortlistCount)}%"></div></div>${list}<div class="dividerline"></div>${s.order.sent?'<div class="hint">Официальный список уже отправлен. Его исходный состав сохранён.</div>':btn(`Отправить полный список кандидатов (${count()}/${s.order.shortlistCount})`,'openSubmit()',`primary`)+`<p class="right-note" style="margin-top:8px">Отправка доступна только при полном составе.</p>`}</div>`}
function renderShortlist(){return `<div class="stack">${header('Официальный список кандидатов',s.order.title)}${metrics()}${renderShortlistContent()}</div>`}
function renderShortlistContent(){if(!s.order.sent)return `<div class="empty"><div style="font-size:30px;margin-bottom:8px">◷</div><strong>Список кандидатов ещё не отправлен</strong><p style="margin-top:7px">Исполнитель готовит полный список из ${s.order.shortlistCount} кандидатов. Черновой список кандидатов заказчику не виден.</p>${s.role==='executor'?btn('Перейти к подготовке',"navigate('project','pool')",'primary'):''}</div>`;return `<div class="panel"><div class="rowx between"><div><h3>Кандидаты на выбор</h3><div class="small muted">Выбрано ${selected()} из ${s.order.requested}. Исходный состав зафиксирован.</div></div>${btn('История замен',"navigate('history')")}</div>${s.candidates.filter(c=>c.stage==='shortlist').map(c=>`<div class="candidate"><div><div class="name click" onclick="openProfile(${c.id})">${esc(c.name)} ${c.selected?'<span class="tag green">✓ Выбран</span>':''}</div><div class="desc">${esc(c.exp)}</div></div><div class="candidate-actions">${btn('Профиль',`openProfile(${c.id})`)}${s.role==='customer'&&!c.selected&&s.order.status!=='completed'?btn('Выбрать',`openSelect(${c.id})`,'primary'):''}${s.role==='executor'&&!c.selected?btn('Заменить',`openReplacement(${c.id})`):''}</div></div>`).join('')}${s.order.status==='completed'?'<div class="callout good" style="margin-top:14px"><strong>Заказ выполнен.</strong> Это не означает фактический выход кандидата или автоматическую выплату.</div>':''}</div>`}
function renderDraftOrder(){const o=s.newOrders.find(x=>x.id===s.activeDraftId);if(!o)return '<div class="empty">Черновик не найден</div>';return '<div class="stack"><nav class="project-breadcrumbs"><button onclick="closeDetail()">Мои заказы</button><span>›</span><strong>'+esc(o.id)+'</strong></nav><div class="rowx between wrap"><div><div class="eyebrow">Черновик заказа</div><h2 class="section-title" style="margin-top:8px">'+esc(o.title)+'</h2></div><span class="pill-status">Черновик</span></div><div class="grid3"><div class="metric"><span>Нужно подобрать сотрудников</span><b>'+o.requested+'</b></div><div class="metric"><span>Кандидатов на выбор</span><b>'+o.shortlistCount+'</b></div><div class="metric"><span>Статус</span><b style="font-size:17px">Не опубликован</b></div></div><div class="callout info"><strong>Черновик сохранён в демо.</strong><div class="small muted">Публикация и оплата не подключены. Пока это тестовые данные.</div></div><button class="btn" onclick="closeDetail()">← К списку заказов</button></div>'}
function renderCreate(){if(s.role!=='customer')return '<div class="empty">Создание заказа доступно заказчику.</div>';return `<div class="stack"><div><div class="eyebrow">Новый заказ · Шаг 1 из 2</div><h2 class="section-title">Создание заказа</h2><p class="muted small">Поля и структура показаны для согласования интерфейса. Оплата в этом прототипе не подключена.</p></div><form class="panel stack" onsubmit="createOrder(event)"><label class="field">Название вакансии<input id="new-title" value="Менеджер по продажам B2B" required></label><div class="grid2"><label class="field">Сколько сотрудников нужно подобрать<input id="new-requested" type="number" min="1" value="3" required oninput="updateCreateHint()"></label><label class="field">Сколько кандидатов показать на выбор<input id="new-shortlist" type="number" min="1" value="6" required oninput="updateCreateHint()"></label></div><div class="hint" id="create-hint">Например, выбрать 3 сотрудников из 6 кандидатов. Размер списка кандидатов не может быть меньше числа сотрудников.</div><label class="field">Описание и требования<textarea id="new-description" placeholder="Опыт, обязанности, условия и ожидания"></textarea></label><div class="grid2"><label class="field">Город<input id="new-city" value="Москва"></label><label class="field">Зарплата<input id="new-salary" value="от 120 000 ₽"></label></div><div class="callout info"><strong>Гарантия и оплата</strong><div class="small">Срок гарантии и платёжные условия зависят от согласований. В демонстрации не создаются платёжные обязательства.</div></div><div class="rowx between">${btn('Отмена',"navigate('project')")}<button type="submit" class="btn primary">Сохранить черновик заказа</button></div></form></div>`}
function updateCreateHint(){let a=+$('new-requested').value,b=+$('new-shortlist').value;$('create-hint').textContent=a>0&&b>=a?`Заказчик выберет ${a} из ${b} кандидатов.`:'Ошибка: размер списка кандидатов должен быть не меньше количества сотрудников.';$('create-hint').style.color=a>0&&b>=a?'var(--muted)':'#a33333'}
function createOrder(e){e.preventDefault();let a=+$('new-requested').value,b=+$('new-shortlist').value;if(a<1||b<a){toast('Проверьте количество сотрудников и размер списка кандидатов');return}let o={id:'З-ДЕМО-'+(s.newOrders.length+1),title:$('new-title').value.trim(),customer:'ООО «Вектор»',requested:a,shortlistCount:b,status:'draft',sent:false};s.newOrders.unshift(o);addHistory(`Создан черновик заказа «${o.title}» (${a} из ${b})`);toast('Черновик создан. Оплата и публикация в демо не подключены.');closeDetail()}
function renderCandidates(){return `<div class="stack"><div class="screen-top"><h2>Моя база кандидатов</h2>${btn('+ Добавить кандидата','openAddCandidate()','primary')}</div><div class="panel">${s.candidates.map(c=>`<div class="candidate"><div><strong>${esc(c.name)}</strong><div class="desc">${esc(c.exp)}</div></div>${btn('Открыть профиль',`openProfile(${c.id})`)}</div>`).join('')}</div></div>`}
function renderHistory(){return `<div class="stack"><h2 class="section-title">История проекта</h2>${renderHistoryContent()}</div>`};function renderHistoryContent(compact=false){return `<div class="panel"><h3>${compact?'Последние действия':'Журнал действий и замен'}</h3><ol class="history">${s.history.slice(0,compact?4:50).map(h=>`<li><time>${esc(h.at)}</time><strong>${esc(h.text)}</strong></li>`).join('')}</ol>${s.original?`<div class="hint">Первоначально отправлено: ${s.original.map(x=>esc(x.name)).join(', ')}. История исходного состава неизменна.</div>`:''}</div>`}
function renderDocuments(){return `<div class="panel"><h3>Документы проекта</h3><div class="candidate"><div><strong>Договор-оферта № 1039</strong><div class="desc">Демонстрационный документ</div></div>${btn('Открыть',"toast('Документ не подключён в демонстрационном прототипе')")}</div><div class="candidate"><div><strong>Акты и расчёты</strong><div class="desc">Финансовые правила ожидают согласования</div></div><span class="tag amber">Не утверждено</span></div></div>`}
function renderRequirements(){return `<div class="panel"><h3>Требования вакансии</h3><p>Продажи B2B, опыт работы с CRM, сложные сделки и переговоры с корпоративными клиентами.</p><div class="dividerline"></div><div class="small muted">График: 5/2 · Москва · Зарплата от 120 000 ₽ + бонусы</div></div>`}
function renderMessages(){return `<div class="stack"><h2 class="section-title">Сообщения по заказу</h2><div class="panel stack"><div class="hint">Демонстрационный диалог. Отправка не уходит реальному пользователю.</div><div id="chat-items"><div class="candidate"><div><strong>Владимир Ларин</strong><div class="desc">Добрый день! Как продвигается подбор?</div></div></div></div><label class="field">Сообщение<textarea id="chat-message" placeholder="Напишите сообщение..."></textarea></label>${btn('Отправить сообщение','sendMessage()','primary')}</div></div>`};function sendMessage(){let x=$('chat-message').value.trim();if(!x){toast('Введите сообщение');return}$('chat-items').insertAdjacentHTML('beforeend',`<div class="candidate"><div><strong>Вы</strong><div class="desc">${esc(x)}</div></div></div>`);$('chat-message').value='';addHistory('Отправлено сообщение в демонстрационном чате');toast('Сообщение добавлено в демо-чат')}
function renderMarket(){return `<div class="stack"><h2 class="section-title">Биржа заказов</h2><div class="panel"><div class="candidate"><div><strong>Менеджер по продажам B2B</strong><div class="desc">Москва · заказ З-1039 · пример карточки биржи</div></div>${btn('Посмотреть заказ',"openOrder('З-1039')",'primary')}</div><div class="hint">Отклики, переговоры и резерв исполнителей будут спроектированы в отдельном модуле.</div></div></div>`}
function openCountModal(){if(s.order.sent){toast('После отправки размер списка кандидатов менять нельзя');return}modal('Изменить размер списка кандидатов',`<div class="stack"><p class="small muted">Сейчас требуется ${s.order.shortlistCount} кандидатов. Минимум — ${s.order.requested}.</p><label class="field">Новый размер списка кандидатов<input id="count-input" type="number" min="${s.order.requested}" value="${s.order.shortlistCount}"></label><div class="hint">Уменьшение применяется сразу. Увеличение требует явного подтверждения исполнителя.</div></div>`,`${btn('Отмена','closeModal()')}${btn('Продолжить','saveCount()','primary')}`)}
function saveCount(){if(s.order.sent||s.role!=='customer')return toast('Изменение доступно только заказчику до отправки');let n=+$('count-input').value;if(!Number.isInteger(n)||n<s.order.requested){toast('Размер списка кандидатов не может быть меньше числа сотрудников');return}if(n===s.order.shortlistCount){closeModal();return}if(n>s.order.shortlistCount){s.increase=n;addHistory(`Заказчик запросил увеличение списка кандидатов до ${n}`);notify(`Запрос увеличить список кандидатов до ${n}`);closeModal();render();toast('Запрос отправлен исполнителю. Размер пока не изменён.');return}s.order.shortlistCount=n;s.order.version++;addHistory(`Заказчик уменьшил размер списка кандидатов до ${n}`);notify(`Размер списка кандидатов уменьшен до ${n}`);closeModal();render();toast('Новый размер сохранён')}
function acceptIncrease(){if(!s.increase||s.order.sent){toast('Изменение размера уже недоступно');return;}s.order.shortlistCount=s.increase;s.increase=null;s.order.version++;addHistory(`Исполнитель подтвердил увеличение списка кандидатов до ${s.order.shortlistCount}`);notify('Исполнитель согласовал увеличение списка кандидатов');render();toast('Новый размер согласован')};function rejectIncrease(){if(!s.increase||s.order.sent){toast('Запрос недоступен');return;}addHistory(`Исполнитель отказал в увеличении до ${s.increase}`);notify('Исполнитель отклонил запрос увеличения');s.increase=null;render();toast('Запрос отклонён')}
function addToShortlist(id){if(s.order.sent)return toast('Список уже официально отправлен');if(count()>=s.order.shortlistCount)return toast('Рабочий список кандидатов заполнен');let c=s.candidates.find(x=>x.id===id);c.stage='shortlist';addHistory(`Добавлен в рабочий список кандидатов: ${c.name}`);render();toast('Кандидат добавлен в рабочий список, заказчику ещё не отправлен')};function removeFromShortlist(id){if(s.order.sent)return toast('После отправки удалить нельзя');let c=s.candidates.find(x=>x.id===id);c.stage='pool';addHistory(`Возвращён в Pool: ${c.name}`);render()}
function openSubmit(){if(s.order.sent)return toast('Список уже отправлен');if(count()!==s.order.shortlistCount)return toast(`Нужен полный список кандидатов: ${count()} из ${s.order.shortlistCount}`);modal('Отправить полный список кандидатов?',`<p>Заказчик получит <strong>${count()} кандидатов</strong>. Исходный состав будет зафиксирован.</p><div class="callout" style="margin-top:12px">После отправки нельзя менять размер списка или односторонне отказаться от заказа. Замена выбывшего невыбранного кандидата сохранит историю.</div>`,`${btn('Назад','closeModal()')}${btn('Подтвердить отправку','submitShortlist()','primary')}`)};function submitShortlist(){if(s.order.sent||count()!==s.order.shortlistCount)return toast('Состав изменился. Проверьте список.');s.original=s.candidates.filter(c=>c.stage==='shortlist').map(c=>({id:c.id,name:c.name}));s.order.sent=true;addHistory(`Официально отправлен полный список кандидатов: ${s.original.map(c=>c.name).join(', ')}`);notify('Полный список кандидатов отправлен заказчику');closeModal();render();toast('Список кандидатов официально отправлен')}
function openProfile(id){let c=s.candidates.find(x=>x.id===id);if(s.role==='customer'&&(!s.order.sent||c.stage!=='shortlist'))return toast('Заказчик видит только официально отправленных кандидатов');modal(c.name,`<div class="stack"><span class="tag">${c.stage==='shortlist'?'Список кандидатов':'Pool'}</span><p><strong>Опыт:</strong> ${esc(c.exp)}</p><p><strong>Источник:</strong> ${esc(c.source)}</p><p class="hint">Профиль демонстрационный. Контактные данные и записи интервью здесь намеренно не раскрываются.</p></div>`,`${btn('Закрыть','closeModal()')}${s.role==='customer'&&s.order.sent&&!c.selected&&s.order.status!=='completed'?btn('Выбрать кандидата',`closeModal();openSelect(${id})`,'primary'):''}`)}
function openSelect(id){if(s.role!=='customer'||!s.order.sent)return toast('Выбор доступен только заказчику после отправки');let c=s.candidates.find(x=>x.id===id);if(!c||c.stage!=='shortlist'||c.selected||selected()>=s.order.requested)return toast('Кандидата нельзя выбрать');modal('Окончательно выбрать кандидата?',`<p>Вы подтверждаете выбор <strong>${esc(c.name)}</strong> по заказу ${esc(s.order.id)}.</p><div class="callout info" style="margin-top:12px">После окончательного выбора обычная замена недоступна. При невыходе используется гарантийная процедура.</div>`,`${btn('Отмена','closeModal()')}${btn('Подтвердить выбор',`selectCandidate(${id})`,'primary')}`)};function selectCandidate(id){if(s.role!=='customer'||!s.order.sent)return toast('Выбор доступен только заказчику после отправки');let c=s.candidates.find(x=>x.id===id);if(!c||c.selected||c.stage!=='shortlist'||selected()>=s.order.requested)return toast('Выбор недоступен');c.selected=true;addHistory(`Заказчик окончательно выбрал кандидата: ${c.name}`);if(selected()===s.order.requested){s.order.status='completed';addHistory('Заказ автоматически перешёл в состояние «Выполнен»');notify('Заказ выполнен: выбрано нужное число кандидатов')}closeModal();render();toast('Выбор сохранён. Автоматических выплат не производится.')}
function openReplacement(id){if(!s.order.sent||s.role!=='executor')return toast('Замена недоступна');let c=s.candidates.find(x=>x.id===id);if(!c||c.selected||c.stage!=='shortlist')return toast('Выбранного кандидата можно заменить только через гарантию');let opts=s.candidates.filter(x=>x.stage==='pool');if(!opts.length)return toast('Для замены сначала добавьте нового кандидата в базу');modal('Замена выбывшего кандидата',`<div class="stack"><p>Выбывший кандидат: <strong>${esc(c.name)}</strong></p><label class="field">Новый кандидат<select id="replacement-id">${opts.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label><label class="field">Основание выбытия<textarea id="replacement-reason" placeholder="Например: кандидат отказался от участия"></textarea></label><div class="hint">Исходный состав официального списка сохранится. Заказчик увидит обновлённый список и историю замены.</div></div>`,`${btn('Отмена','closeModal()')}${btn('Подтвердить замену',`replaceCandidate(${id})`,'primary')}`)}
function replaceCandidate(id){if(s.role!=='executor'||!s.order.sent)return toast('Замена недоступна');let old=s.candidates.find(x=>x.id===id),n=s.candidates.find(x=>x.id===+$('replacement-id').value),reason=$('replacement-reason').value.trim();if(!reason){toast('Укажите причину выбытия');return}if(!old||old.selected||old.stage!=='shortlist'||!n||n.stage!=='pool')return toast('Нельзя выполнить замену');old.stage='withdrawn';n.stage='shortlist';s.replacements.push({old:old.name,new:n.name,reason});addHistory(`Замена выбывшего кандидата: ${old.name} → ${n.name}. Причина: ${reason}`);notify(`Изменился состав списка кандидатов: ${old.name} заменён на ${n.name}`);closeModal();render();toast('Замена сохранена, заказчик уведомлён')}
function openAddCandidate(){modal('Добавить кандидата в Pool',`<div class="stack"><label class="field">ФИО<input id="candidate-name" placeholder="Имя и фамилия"></label><label class="field">Опыт и квалификация<input id="candidate-exp" placeholder="Например: 5 лет, B2B-продажи"></label><div class="hint">В настоящем продукте требуется подтверждение кандидата и законное основание обработки данных. В демо создаётся только тестовая запись.</div></div>`,`${btn('Отмена','closeModal()')}${btn('Добавить в Pool','addCandidate()','primary')}`)};function addCandidate(){let name=$('candidate-name').value.trim(),exp=$('candidate-exp').value.trim();if(!name||!exp)return toast('Заполните ФИО и опыт');let id=Math.max(...s.candidates.map(x=>x.id))+1;s.candidates.push({id,name,exp,source:'Добавлен вручную',stage:'pool',selected:false});addHistory(`Добавлен в Pool: ${name}`);closeModal();render();toast('Тестовый кандидат добавлен в Pool')}
function showNotifications(){modal('Уведомления',`<div class="stack">${s.notifications.length?s.notifications.map(n=>`<div class="hint">${esc(n)}</div>`).join(''):'<p class="muted">Новых уведомлений нет</p>'}</div>`,`${btn('Закрыть','closeModal()')}${btn('Отметить прочитанными','clearNotifications()','primary')}`)};function clearNotifications(){s.notifications=[];closeModal();render()};Object.defineProperty(window,'s',{configurable:true,get:()=>s,set:value=>{s=value}});
window.acceptIncrease=acceptIncrease;
window.addCandidate=addCandidate;
window.addToShortlist=addToShortlist;
window.btn=btn;
window.clearNotifications=clearNotifications;
window.closeDetail=closeDetail;
window.closeModal=closeModal;
window.createOrder=createOrder;
window.customerBanner=customerBanner;
window.executorActions=executorActions;
window.header=header;
window.metrics=metrics;
window.modal=modal;
window.navigate=navigate;
window.openAddCandidate=openAddCandidate;
window.openCountModal=openCountModal;
window.openOrder=openOrder;
window.openProfile=openProfile;
window.openReplacement=openReplacement;
window.openSelect=openSelect;
window.openSubmit=openSubmit;
window.primaryCreate=primaryCreate;
window.rejectIncrease=rejectIncrease;
window.removeFromShortlist=removeFromShortlist;
window.render=render;
window.renderCandidates=renderCandidates;
window.renderCreate=renderCreate;
window.renderDocuments=renderDocuments;
window.renderDraftOrder=renderDraftOrder;
window.renderHistory=renderHistory;
window.renderHistoryContent=renderHistoryContent;
window.renderList=renderList;
window.renderMain=renderMain;
window.renderMarket=renderMarket;
window.renderMessages=renderMessages;
window.renderPool=renderPool;
window.renderProject=renderProject;
window.renderRequirements=renderRequirements;
window.renderShortlist=renderShortlist;
window.renderShortlistContent=renderShortlistContent;
window.replaceCandidate=replaceCandidate;
window.resetDemo=resetDemo;
window.saveCount=saveCount;
window.selectCandidate=selectCandidate;
window.sendMessage=sendMessage;
window.setRole=setRole;
window.showNotifications=showNotifications;
window.submitShortlist=submitShortlist;
window.toast=toast;
window.updateCreateHint=updateCreateHint;
const iconPaths={"search":"<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m16.5 16.5 4.2 4.2\"/>","notifications":"<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9\"/><path d=\"M10 21h4\"/>","person_add":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M19 8v6M16 11h6\"/>","folder_special":"<path d=\"M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><path d=\"m16 11 .8 1.5 1.7.2-1.3 1.2.3 1.7-1.5-.8-1.5.8.3-1.7-1.3-1.2 1.7-.2z\"/>","travel_explore":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 16 2-6 6-2-2 6z\"/>","contacts":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/><path d=\"M7 18c0-3 2-5 5-5s5 2 5 5\"/>","group":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.9M16 3a4 4 0 0 1 0 8\"/>","chat_bubble_outline":"<path d=\"M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.8-5.5a9 9 0 0 1-.8-4A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5z\"/>","history":"<path d=\"M3 12a9 9 0 1 0 2.6-6.4L3 8\"/><path d=\"M3 3v5h5M12 7v5l4 2\"/>","add_circle":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8v8M8 12h8\"/>","chevron_right":"<path d=\"m9 18 6-6-6-6\"/>"};
const hydrateIcons=()=>{for(const element of document.querySelectorAll('.sp-original-app .badge-icon,.sp-original-app .material-symbols-outlined')){if(element.dataset.spIconReady==='1')continue;const key=element.textContent.trim();const paths=iconPaths[key];if(!paths)continue;element.innerHTML='<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';element.dataset.spIconReady='1';}};
const appRoot=document.querySelector('.sp-original-app');const iconObserver=new MutationObserver(hydrateIcons);if(appRoot)iconObserver.observe(appRoot,{subtree:true,childList:true});

function ensureV3State(){
 if(s._v3)return;
 s._v3=true;
 s.history=[
  {at:"14.11, 12:12",text:"Ольга Белова добавлена в рабочий список кандидатов",actor:"Анна Ершова"},
  {at:"09.11, 14:35",text:"Мария Соколова добавлена в рабочий список кандидатов",actor:"Анна Ершова"},
  {at:"28.10, 09:25",text:"Исполнитель Анна Ершова приступила к выполнению заказа",actor:"Анна Ершова"},
  {at:"28.10, 09:10",text:"Назначен исполнитель Анна Ершова",actor:"ООО «Вектор»"},
  {at:"28.10, 08:45",text:"Заказ З-1039 создан заказчиком",actor:"ООО «Вектор»"}
 ];
 s.applications=[
  {id:101,name:"Артём Ковалёв",position:"Менеджер по продажам B2B",experience:6,city:"Москва",salary:140000,skills:["B2B","CRM","Переговоры","SaaS"],companies:["ООО «Сфера Софт» — старший менеджер, 2022–2026","ООО «Партнёр» — менеджер продаж, 2020–2022"],letter:"Здравствуйте! Более шести лет работаю с корпоративными клиентами, развивал продажи SaaS и готов рассказать о результатах на интервью.",status:"new",relevance:96,date:"15.11.2026",education:"РЭУ им. Г. В. Плеханова · Менеджмент",summary:"Вёл полный цикл B2B-продаж, проводил демонстрации, согласовывал договоры с ключевыми клиентами."},
  {id:102,name:"Дарья Смирнова",position:"Аккаунт-менеджер",experience:5,city:"Москва",salary:125000,skills:["Key Account","Bitrix24","FMCG","Аналитика"],companies:["ГК «Восток» — KAM, 2023–2026","ООО «Лидер» — менеджер, 2021–2023"],letter:"",status:"new",relevance:89,date:"14.11.2026",education:"МГУПП · Экономика",summary:"Работа с корпоративными клиентами, развитие существующей базы и переговоры на уровне руководителей."},
  {id:103,name:"Никита Фролов",position:"Менеджер активных продаж",experience:3,city:"Санкт-Петербург",salary:115000,skills:["B2B","Холодные звонки","amoCRM"],companies:["ООО «Ресурс» — менеджер продаж, 2023–2026"],letter:"Интересна вакансия с перспективой роста. Работал с холодным поиском и исходящими продажами.",status:"new",relevance:81,date:"13.11.2026",education:"СПбГЭУ · Маркетинг",summary:"Поиск клиентов, первичные переговоры, ведение сделок в amoCRM."},
  {id:104,name:"Евгения Кравцова",position:"Руководитель группы продаж",experience:8,city:"Москва",salary:175000,skills:["B2B","Команда","CRM","Тендеры"],companies:["АО «Меридиан» — руководитель группы, 2020–2026","ООО «Орион» — менеджер, 2018–2020"],letter:"Добрый день! Ваша вакансия заинтересовала, есть опыт управления командой продаж и личных крупных сделок.",status:"new",relevance:94,date:"12.11.2026",education:"НИУ ВШЭ · Менеджмент",summary:"Руководила группой из восьми менеджеров, участвовала в сложных продажах и тендерных процедурах."},
  {id:105,name:"Иван Петров",position:"Специалист по продажам",experience:2,city:"Казань",salary:100000,skills:["CRM","Телефония","Клиентский сервис"],companies:["ООО «Рост» — специалист, 2024–2026"],letter:"",status:"new",relevance:62,date:"11.11.2026",education:"КФУ · Экономика",summary:"Двухлетний опыт работы с входящими лидами и сопровождением клиентов."},
  {id:106,name:"Полина Сергеева",position:"Менеджер корпоративных продаж",experience:7,city:"Москва",salary:155000,skills:["B2B","Сложные сделки","1С","Excel"],companies:["ООО «Интерком» — ведущий менеджер, 2021–2026","ООО «Тренд» — менеджер, 2019–2021"],letter:"Здравствуйте! Умею развивать клиентскую базу с нуля, есть опыт договорной работы и длинных сделок.",status:"new",relevance:91,date:"10.11.2026",education:"Финансовый университет · Менеджмент",summary:"Работа с федеральными клиентами, переговоры и сопровождение контрактов на крупных суммах."}
 ];
 s.responseFilters={search:"",experience:"all",location:"all",skills:"all",letter:false,status:"all",sort:"relevance"};
 s.documents=[{id:1,name:"Договор-оферта № 1039",type:"Договор",target:"Общий документ",date:"28.10.2026",demo:true},{id:2,name:"Требования к вакансии.pdf",type:"Требования",target:"Общий документ",date:"28.10.2026",demo:true}];
 s.chatMessages=[{mine:false,time:"Сегодня, 10:42",text:"Анна, добрый день! Подскажите, когда сможем посмотреть кандидатов?"},{mine:true,time:"Сегодня, 10:48",text:"Здравствуйте! Сейчас готовим полный список кандидатов. Отправлю сразу после проверки всех трёх кандидатов."}];
 s.nextCandidateId=200;
}

function financePreviewV3(){const base=30000,guarantee=10500,feeBase=3000,feeGuarantee=1050,baseNet=base-feeBase,retained=8100;return {base,guarantee,feeBase,feeGuarantee,first:baseNet-retained,retained,afterGuarantee:guarantee-feeGuarantee,total:baseNet+guarantee-feeGuarantee,customerTotal:base+guarantee};}

function moneyV3(v){return Number(v).toLocaleString("ru-RU")+" ₽";}

function renderListV3(){
 ensureV3State();const search=($("search")?.value||"").toLowerCase();
 $("list-title").textContent=s.role==="customer"?"Мои заказы":"Мои проекты в работе";
 $("filters").innerHTML=[["all","Все"],["active","В работе"],["completed","Выполнены"]].map(([k,l])=>`<button class="filter-chip ${s.filter===k?"active":""}" onclick="s.filter='${k}';renderList()">${l}</button>`).join("");
 let orders=[s.order,...s.newOrders].filter(o=>(s.filter==="all"||(s.filter==="completed"?o.status==="completed":o.status!=="completed"))&&(`${o.title} ${o.id} ${o.customer}`.toLowerCase().includes(search)));
 if(s.sort==="title")orders.sort((a,b)=>a.title.localeCompare(b.title,"ru"));
 const fin=financePreviewV3(),exec=s.role==="executor";
 const status=o=>o.status==="completed"?"Выполнен":o.sent?"Отправлен":o.status==="draft"?"Черновик":`Подготовка ${o.id===s.order.id?count():0}/${o.shortlistCount}`;
 $("project-list").innerHTML=orders.length?`<div class="project-table-wrap"><table class="project-table project-v3-table"><thead><tr><th>№ заказа</th><th>Проект / вакансия</th><th>Заказчик</th><th>Кандидаты</th><th>Статус</th>${exec?"<th>К получению</th>":""}<th>Срок</th><th></th></tr></thead><tbody>${orders.map(o=>`<tr class="project-tr" tabindex="0" role="button" onclick="openOrder('${esc(o.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openOrder('${esc(o.id)}')}" aria-label="Открыть заказ ${esc(o.id)}"><td class="project-number">${esc(o.id)}</td><td class="project-name">${esc(o.title)}</td><td>${esc(o.customer)}</td><td>${o.requested} из ${o.shortlistCount}</td><td><span class="pill ${o.status==="completed"?"ok":"warn"}">${status(o)}</span></td>${exec?`<td><div class="earn-amount">${o.id===s.order.id?moneyV3(fin.total):"—"}</div><div class="earn-sub">${o.id===s.order.id?`${moneyV3(fin.first)} · первый этап`:"Не рассчитано"}</div></td>`:""}<td>15.11.2026</td><td class="project-chevron"><span class="badge-icon">chevron_right</span></td></tr>`).join("")}</tbody></table></div><div class="list-finance-hint">* Предварительный расчёт по демонстрационному тарифу. Выплаты зависят от согласованных условий.</div>`:'<div class="empty">По вашему запросу заказов нет</div>';
}

function headerV3(title,subtitle){
 const status=s.order.status==="completed"?"✓ Выполнен":s.order.sent?"Список кандидатов отправлен":`Список кандидатов ${count()} из ${s.order.shortlistCount}`;
 const icon='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 21l1.8-5.4a8.5 8.5 0 0 1-.8-4.1A8 8 0 0 1 12 3a8 8 0 0 1 8 8.5z"/></svg>';
 return `<nav class="project-breadcrumbs" aria-label="Хлебные крошки"><button onclick="closeDetail()">${s.role==="customer"?"Мои заказы":"Мои проекты в работе"}</button><span>›</span><strong>${esc(s.order.id)} · ${esc(s.order.title)}</strong></nav><div class="order-summary"><div><h2>${esc(title)}</h2><div class="small muted" style="margin-top:5px">Заказ № ${esc(s.order.id)} · ${esc(subtitle)}</div></div><div class="order-status-column"><span class="pill-status">${status}</span><button class="chat-trigger" type="button" title="Чат с заказчиком" aria-label="Открыть чат с заказчиком" onclick="openChatDrawer()">${icon}<span class="chat-count">2</span></button></div></div>`;
}

function metricsV3(){
 const n=count(),max=s.order.shortlistCount,pct=Math.min(100,Math.round(100*n/max));
 return `<div class="recruitment-overview"><div class="recruitment-main"><div class="recruitment-title-row"><div><div class="eyebrow">Ход подбора</div><strong>${s.order.sent?"Полный список кандидатов отправлен":n===max?"Список кандидатов готов к отправке":"Формируем список кандидатов"}</strong></div><span class="tag ${n===max?"green":""}">${n} из ${max}</span></div><div class="progress"><div style="width:${pct}%"></div></div><div class="right-note">${s.order.sent?"Кандидаты доступны заказчику":"Готовность официального списка · "+pct+"%"}</div></div><div class="recruitment-facts"><div><span>Нужно нанять</span><strong>${s.order.requested}</strong></div><div><span>Выбрано заказчиком</span><strong>${selected()} <small>из ${s.order.requested}</small></strong></div></div></div>`;
}

function executorActionsV3(){
 return s.increase?`<div class="callout info"><strong>Заказчик предлагает увеличить список кандидатов до ${s.increase} кандидатов</strong><div class="rowx wrap" style="margin-top:10px">${btn("Согласиться","acceptIncrease()","primary")}${btn("Отказать","rejectIncrease()")}</div></div>`:"";
}

function renderProjectV3(){
 const customer=s.role==="customer";
 const tabs=customer?[["shortlist","Список кандидатов"],["requirements","Требования вакансии"],["history","История"],["documents","Документы"]]:[["pool","Кандидаты"],["responses","Отклики"],["requirements","Требования вакансии"],["job","Моя вакансия"],["history","История"],["documents","Документы"],["payment","Оплата"]];
 const content=s.tab==="pool"?renderPool():s.tab==="responses"?renderResponsesV4():s.tab==="job"?renderJobV4():s.tab==="shortlist"?renderShortlistContent():s.tab==="history"?renderHistoryContent():s.tab==="documents"?renderDocuments():s.tab==="payment"?renderPaymentV3():renderRequirements();
 return `<div class="stack" style="gap:17px">${header(s.order.title,customer?"Вы заказчик · ООО «Вектор»":"Вы назначены исполнителем · Заказчик ООО «Вектор»")}<div class="steps-mini"><span>✓ Заказ</span><span>✓ Назначение</span><span class="${!s.order.sent?"active":""}">3. Подготовка</span><span class="${s.order.sent&&s.order.status!=="completed"?"active":""}">4. Отправка и выбор</span><span class="${s.order.status==="completed"?"active":""}">5. Выполнен</span></div>${customer?customerBanner():executorActions()}${metrics()}<div class="tabs project-tabs">${tabs.map(([k,l])=>`<button class="tab ${s.tab===k?"active":""}" onclick="s.tab='${k}';renderMain()">${l}</button>`).join("")}</div>${content}</div>`;
}

function renderPoolV3(){
 const visible=s.candidates.filter(c=>c.stage!=="withdrawn");
 const list=visible.map(c=>`<div class="candidate"><div class="candidate-main"><div class="name click" onclick="openProfile(${c.id})">${esc(c.name)} <span class="tag ${c.stage==="pool"?"gray":""}">${c.stage==="pool"?"В рабочем списке":"В списке кандидатов"}</span></div><div class="desc">${esc(c.exp)} · ${esc(c.source)}</div></div><div class="candidate-actions">${btn("Профиль",`openProfile(${c.id})`)}${!s.order.sent?(c.stage==="pool"?btn("В список кандидатов",`addToShortlist(${c.id})`,"primary"):btn("Убрать",`removeFromShortlist(${c.id})`)):(!c.selected&&c.stage==="shortlist"?btn("Заменить",`openReplacement(${c.id})`):"")}</div></div>`).join("");
 return `<div class="panel candidates-panel"><div class="section-toolbar"><div><h3>Кандидаты проекта</h3><div class="small muted">${visible.length} кандидатов · в списке кандидатов ${count()} из ${s.order.shortlistCount}</div></div>${btn("+ Добавить кандидата","openAddMenu()","primary")}</div><div class="progress small-progress"><div style="width:${Math.min(100,100*count()/s.order.shortlistCount)}%"></div></div>${list||'<div class="empty">В проекте ещё нет кандидатов</div>'}<div class="pool-bottom">${s.order.sent?'<div class="hint">Список кандидатов официально отправлен. Исходный состав зафиксирован.</div>':`${btn(`Отправить полный список кандидатов (${count()}/${s.order.shortlistCount})`,"openSubmit()","primary")}<span class="right-note">Отправка доступна только при полном составе</span>`}</div></div>`;
}

function renderResponseCardsV3(){
 const f=s.responseFilters;let list=s.applications.filter(a=>{
 const q=f.search.trim().toLowerCase();
 return (!q||[a.name,a.position,a.summary,...a.skills,...a.companies].join(" ").toLowerCase().includes(q))&&(f.experience==="all"||a.experience>=Number(f.experience))&&(f.location==="all"||a.city===f.location)&&(f.skills==="all"||a.skills.some(t=>t.toLowerCase().includes(f.skills.toLowerCase())))&&(!f.letter||!!a.letter)&&(f.status==="all"||a.status===f.status);
 });
 list.sort((a,b)=>f.sort==="date"?b.id-a.id:f.sort==="experience"?b.experience-a.experience:b.relevance-a.relevance);
 const status=a=>a.status==="added"?"В кандидатах":a.status==="rejected"?"Отклонён":a.status==="viewed"?"Просмотрен":"Новый";
 return list.length?list.map(a=>`<article class="applicant-card"><div class="applicant-head"><div><div class="rowx wrap gap6"><strong>${esc(a.name)}</strong><span class="tag ${a.status==="added"?"green":a.status==="rejected"?"gray":""}">${status(a)}</span></div><div class="small muted">${esc(a.position)} · ${a.experience} лет · ${esc(a.city)}</div></div><div class="applicant-score"><strong>${a.relevance}%</strong><small>совпадение</small></div></div><div class="applicant-data"><div><span>Опыт и компании</span><b>${esc(a.companies[0])}</b></div><div><span>Ожидания</span><b>от ${moneyV3(a.salary)}</b></div></div><p class="applicant-description">${esc(a.summary)}</p><div class="applicant-skills">${a.skills.map(t=>`<span>${esc(t)}</span>`).join("")}</div>${a.letter?`<div class="applicant-letter"><strong>Сопроводительное письмо</strong><p>${esc(a.letter)}</p></div>`:'<div class="applicant-noletter">Сопроводительное письмо не приложено</div>'}<div class="applicant-actions">${btn("Подробный профиль",`openProfile(${a.id})`)}${a.status==="added"?'<span class="tag green">✓ В кандидатах</span>':a.status==="rejected"?btn("Восстановить",`restoreApplicantV3(${a.id})`):`${btn("Добавить в кандидаты",`addApplicantV3(${a.id})`,"primary")}${btn("Отклонить",`rejectApplicantV3(${a.id})`)}`}</div></article>`).join(""):'<div class="empty">По выбранным фильтрам откликов нет. Попробуйте изменить условия поиска.</div>';
}

function renderResponsesV3(){
 return `<div class="panel responses-panel"><div class="section-toolbar"><div><h3>Отклики соискателей</h3><p class="small muted">Люди, которые самостоятельно откликнулись на вакансию через платформу</p></div><span class="tag">${s.applications.length} откликов</span></div><div class="response-toolbar"><label class="field response-search">Поиск по откликам<input type="search" value="${esc(s.responseFilters.search)}" placeholder="Имя, компания, навыки…" oninput="setResponseFilterV3('search',this.value)"></label><label class="field">Опыт<select onchange="setResponseFilterV3('experience',this.value)"><option value="all">Любой</option><option value="3">От 3 лет</option><option value="5">От 5 лет</option><option value="7">От 7 лет</option></select></label><label class="field">Город<select onchange="setResponseFilterV3('location',this.value)"><option value="all">Все города</option><option>Москва</option><option>Санкт-Петербург</option><option>Казань</option></select></label><label class="field">Навыки<select onchange="setResponseFilterV3('skills',this.value)"><option value="all">Все навыки</option><option>B2B</option><option>CRM</option><option>Переговоры</option><option>Тендеры</option></select></label><label class="field">Статус<select onchange="setResponseFilterV3('status',this.value)"><option value="all">Все</option><option value="new">Новые</option><option value="added">Добавлены</option><option value="rejected">Отклонены</option></select></label><label class="field">Сортировка<select onchange="setResponseFilterV3('sort',this.value)"><option value="relevance">По совпадению</option><option value="date">По дате</option><option value="experience">По опыту</option></select></label></div><div class="response-summary rowx between"><label class="checkbox-row"><input type="checkbox" onchange="setResponseFilterV3('letter',this.checked)"> Только с сопроводительным письмом</label><span class="small muted" id="response-count">${s.applications.length} откликов</span></div><div id="response-list" class="responses-list">${renderResponseCardsV3()}</div></div>`;
}

function setResponseFilterV3(key,value){s.responseFilters[key]=value;renderResponseListV3();}

function renderResponseListV3(){const el=$("response-list");if(el)el.innerHTML=renderResponseCardsV3();const countEl=$("response-count");if(countEl)countEl.textContent=el.querySelectorAll(".applicant-card").length+" откликов";}

function addApplicantV3(id){
 const app=s.applications.find(a=>a.id===id);if(!app||app.status==="added")return;
 app.status="added";const candidate={id:s.nextCandidateId++,name:app.name,exp:app.experience+" лет · "+app.skills.slice(0,3).join(", "),source:"Отклик с платформы",stage:"pool",selected:false,applicationId:app.id};
 s.candidates.push(candidate);addHistory(`Соискатель ${app.name} добавлен из откликов в кандидаты`);s.tab="pool";renderMain();toast("Отклик добавлен в кандидаты проекта");
}

function rejectApplicantV3(id){const a=s.applications.find(x=>x.id===id);if(!a||a.status==="added")return;a.status="rejected";addHistory(`Отклонён отклик: ${a.name}`);renderResponseListV3();toast("Отклик отклонён в демо");}

function restoreApplicantV3(id){const a=s.applications.find(x=>x.id===id);if(!a)return;a.status="new";renderResponseListV3();}

function renderRequirementsV3(){
 const items=(arr)=>arr.map(t=>`<li>${esc(t)}</li>`).join("");
 return `<div class="requirements-stack"><div class="requirements-note">Данные вакансии приведены как <strong>демонстрационный пример</strong>. В рабочем продукте здесь будут все согласованные заказчиком условия.</div><div class="req-grid"><section class="panel"><div class="req-heading"><h3>О вакансии</h3><span class="tag">Основное</span></div><dl class="req-facts"><div><dt>Должность</dt><dd>Менеджер по продажам B2B</dd></div><div><dt>Заказчик</dt><dd>ООО «Вектор»</dd></div><div><dt>Локация</dt><dd>Москва</dd></div><div><dt>Формат</dt><dd>Офис / гибрид по согласованию</dd></div><div><dt>Занятость</dt><dd>Полная, график 5/2</dd></div><div><dt>План найма</dt><dd>1 сотрудник из 3 кандидатов</dd></div></dl></section><section class="panel"><div class="req-heading"><h3>Условия и мотивация</h3></div><dl class="req-facts"><div><dt>Доход</dt><dd>От 120 000 ₽ + бонусы</dd></div><div><dt>Испытательный срок</dt><dd>По договорённости</dd></div><div><dt>Отпуск / оформление</dt><dd>По ТК РФ, условия уточняются</dd></div><div><dt>Срок закрытия</dt><dd>15 ноября 2026 г. · демо</dd></div><div><dt>Выход</dt><dd>По согласованию с кандидатом</dd></div></dl></section></div><div class="req-grid"><section class="panel"><h3>Обязательные требования</h3><ul class="req-bullets">${items(["Опыт корпоративных продаж (B2B) от 3 лет","Уверенная работа с CRM: Bitrix24 или аналог","Переговоры с ЛПР, работа с возражениями","Ведение сделки от первичного контакта до договора"])}</ul></section><section class="panel"><h3>Будет преимуществом</h3><ul class="req-bullets">${items(["Опыт SaaS и технологических продуктов","Участие в тендерах и крупных проектах","Навыки работы с аналитикой продаж","Наличие собственной профессиональной базы клиентов"])}</ul></section></div><div class="req-grid"><section class="panel"><h3>Задачи сотрудника</h3><ul class="req-bullets">${items(["Поиск и развитие корпоративных клиентов","Ведение переговоров и презентаций продукта","Контроль воронки продаж, заполнение CRM","Выполнение плана и развитие действующих договоров"])}</ul></section><section class="panel"><h3>Пожелания заказчика</h3><p class="req-paragraph">В приоритете кандидаты с опытом сложных продаж, умеющие самостоятельно проводить встречи и защищать коммерческое предложение. Рассматриваются профильные кандидаты из смежных отраслей.</p><div class="hint" style="margin-top:12px">Параметры вакансии редактирует заказчик; исполнитель видит согласованную версию условий.</div></section></div><section class="panel"><div class="req-heading"><h3>Гарантийные условия и история</h3><span class="tag amber">Проект условий · не утверждён</span></div><div class="req-guarantee-row"><div><span>Пример срока гарантии</span><strong>3 месяца</strong></div><div><span>Гарантийная надбавка</span><strong>35% · пример</strong></div><div><span>Статус</span><strong>Обращений нет</strong></div></div><div class="dividerline"></div><h4 class="small" style="font-weight:700">История гарантийных событий</h4><div class="hint" style="margin-top:9px">Гарантийных обращений по заказу пока нет. После их появления здесь будет история обращений, согласованных сроков, замен и решений без удаления первоначального выбора кандидатов.</div></section></div>`;
}

function renderHistoryContentV3(compact=false){
 const items=s.history.slice(0,compact?4:100);
 const actor=h=>h.actor||(h.text.includes("Заказчик")?"Заказчик · ООО «Вектор»":h.text.includes("Назначен")?"Заказчик · ООО «Вектор»":"Исполнитель · Анна Ершова");
 return `<div class="panel history-panel"><div class="section-toolbar"><div><h3>История действий по заказу</h3><p class="small muted">Хронология событий и изменений состава списка кандидатов</p></div><span class="tag gray">${items.length} событий</span></div><div class="history-table-scroll"><table class="history-table"><thead><tr><th>Дата и время</th><th>Событие</th><th>Участник</th></tr></thead><tbody>${items.map(h=>`<tr><td><time>${esc(h.at)}</time></td><td>${esc(h.text)}</td><td>${esc(actor(h))}</td></tr>`).join("")}</tbody></table></div>${s.original?`<div class="hint" style="margin-top:15px">Исходный состав отправленного списка кандидатов: ${s.original.map(x=>esc(x.name)).join(", ")}. История замен сохраняется.</div>`:""}</div>`;
}

function renderDocumentsV3(){
 return `<div class="panel docs-panel"><div class="section-toolbar"><div><h3>Документы проекта</h3><p class="small muted">Файлы, анкеты и автоматически сформированные документы</p></div>${btn("+ Добавить","openDocumentMenuV3()","primary")}</div><div class="docs-table"><div class="docs-head"><span>Документ</span><span>Привязка</span><span>Добавлен</span><span>Действие</span></div>${s.documents.map(d=>`<div class="docs-row"><div><span class="doc-file-icon">▤</span><div><strong>${esc(d.name)}</strong><div class="tiny muted">${esc(d.type)}</div></div></div><span>${esc(d.target)}</span><span>${esc(d.date)}</span>${d.url?`<a href="${d.url}" download="${esc(d.name)}" class="btn">Скачать</a>`:btn("Просмотреть",`toast('Демонстрационный документ без содержимого')`)}</div>`).join("")}</div><div class="hint" style="margin-top:15px">В прототипе файлы доступны только в текущем сеансе браузера. Настоящая загрузка в хранилище и генерация официальных документов ещё не подключены.</div></div>`;
}

function renderPaymentV3(){
 const f=financePreviewV3();
 return `<div class="payment-content"><div class="payment-preview-note"><strong>Предварительный расчёт для исполнителя</strong><p>Тестовый пример из ТЗ №02. Ставки, сроки и события выплаты требуют утверждения. Деньги не переводятся.</p></div><div class="payment-summary"><div><span>Потенциально на руки за заказ</span><strong>${moneyV3(f.total)}</strong><small>После комиссий платформы, при успешном исполнении обязательств</small></div><div><span>Первый этап · расчётно</span><strong>${moneyV3(f.first)}</strong><small>Не автоматически при выборе кандидата</small></div></div><section class="panel"><h3>Как формируется сумма</h3><div class="money-table">${[["Базовая стоимость подбора",moneyV3(f.base)],["Гарантия, 3 месяца (+35%)",moneyV3(f.guarantee)],["Заказчику всего",moneyV3(f.customerTotal)],["Комиссия платформы с подбора (10%)","− "+moneyV3(f.feeBase)],["Потенциальная комиссия с гарантии (10%)","− "+moneyV3(f.feeGuarantee)],["Чистое вознаграждение исполнителя",moneyV3(f.total)]].map(([k,v],i)=>`<div class="money-row ${i===2||i===5?"money-emph":""}"><span>${k}</span><strong>${v}</strong></div>`).join("")}</div></section><section class="panel"><h3>Этапы расчётных выплат и резервы</h3><div class="payment-timeline"><div><span class="money-step">01</span><div><strong>Первый этап · ${moneyV3(f.first)}</strong><p>Предполагаемая доступная сумма после отдельно согласованного платёжного события. Выбор заказчиком сам по себе выплату не запускает.</p></div><span class="tag amber">Ожидает условий</span></div><div><span class="money-step">02</span><div><strong>Резерв с основной выплаты · ${moneyV3(f.retained)}</strong><p>30% от чистой суммы подбора. Событие разблокировки согласуется отдельно (например, подтверждённый выход).</p></div><span class="tag gray">Резерв А</span></div><div><span class="money-step">03</span><div><strong>По гарантии · ${moneyV3(f.afterGuarantee)}</strong><p>Гарантийная надбавка после потенциальной комиссии. После успешного завершения гарантийных обязательств по согласованным правилам.</p></div><span class="tag gray">Резерв Б</span></div></div></section><div class="hint">Итого ${moneyV3(f.first)} + ${moneyV3(f.retained)} + ${moneyV3(f.afterGuarantee)} = ${moneyV3(f.total)}. Резервы А и Б не объединяются; даты освобождения могут различаться. Это демонстрация, не обещание выплаты.</div></div>`;
}

renderList=renderListV3;header=headerV3;metrics=metricsV3;executorActions=executorActionsV3;renderProject=renderProjectV3;renderPool=renderPoolV3;renderRequirements=renderRequirementsV3;renderHistoryContent=renderHistoryContentV3;renderDocuments=renderDocumentsV3;
Object.assign(window,{renderList,header,metrics,executorActions,renderProject,renderPool,renderRequirements,renderHistoryContent,renderDocuments,setResponseFilterV3,addApplicantV3,rejectApplicantV3,restoreApplicantV3});


function openProfileV3(id){
 ensureV3State();
 const cand=s.candidates.find(x=>x.id===id);
 const application=s.applications.find(x=>x.id===(cand?.applicationId||id));
 if(!cand&&!application)return toast("Профиль не найден");
 if(s.role==="customer"&&(!s.order.sent||!cand||cand.stage!=="shortlist"))return toast("Заказчик видит только полный отправленный список кандидатов");
 const details={
 1:{title:"Менеджер корпоративных продаж",city:"Москва",salary:"от 145 000 ₽",skills:["B2B","Bitrix24","Переговоры","Сложные сделки"],companies:["ООО «Альфа Софт» · ведущий менеджер по продажам · 2022–2026","ООО «Аспект» · менеджер по работе с клиентами · 2020–2022"],education:"РЭУ им. Г. В. Плеханова · менеджмент",summary:"Сопровождение крупных корпоративных сделок, развитие действующих клиентов, полный цикл продаж, работа с ЛПР и подготовка коммерческих предложений."},
 2:{title:"Старший B2B-менеджер",city:"Москва",salary:"от 150 000 ₽",skills:["B2B","Тендеры","44-ФЗ","Договоры"],companies:["АО «Консалт» · старший менеджер · 2021–2026","ООО «Форум» · менеджер · 2018–2021"],education:"МГИМО · менеджмент",summary:"Более семи лет в корпоративных продажах, работа с тендерной документацией, крупными заказчиками и командными проектами."},
 3:{title:"Менеджер по развитию бизнеса",city:"Москва",salary:"от 115 000 ₽",skills:["Холодные звонки","Дистрибуция","B2B"],companies:["ООО «Квадро» · менеджер по развитию · 2023–2026"],education:"МГУТУ · маркетинг",summary:"Холодный поиск, ведение клиентской базы, подготовка предложений и переговоры."},
 4:{title:"Менеджер по продажам FMCG",city:"Москва",salary:"от 130 000 ₽",skills:["FMCG","Оптовые продажи","Переговоры"],companies:["ООО «Омега» · менеджер продаж · 2021–2026"],education:"РГГУ · менеджмент",summary:"Развитие дистрибьюторских каналов, переговоры с оптовыми партнёрами, выполнение плана продаж."},
 5:{title:"Менеджер по продажам IT-сервисов",city:"Москва",salary:"от 110 000 ₽",skills:["B2B","Сервисы","Презентации"],companies:["ООО «Идея» · менеджер · 2024–2026"],education:"Московский политех · управление",summary:"Работа с коммерческими клиентами, демонстрация сервисов и сопровождение сделок."}
 };
 const d=application||details[id]||{title:"Менеджер по продажам",city:"Москва",salary:"Уточняется",skills:["Продажи","Коммуникация"],companies:[],education:"Не указано",summary:cand?.exp||""};
 const name=cand?.name||application.name;
 const exp=application?`${application.experience} лет опыта`:cand?.exp||"Опыт не указан";
 if(application&&application.status==="new")application.status="viewed";if(s.tab==="responses")renderResponseListV3();
 const companyList=(d.companies||[]).map((c,i)=>`<div class="profile-job"><span class="job-dot">${i+1}</span><div><strong>${esc(c)}</strong><small>Демонстрационная запись для оценки интерфейса</small></div></div>`).join("");
 const content=`<div class="profile-card"><div class="profile-identity"><div class="profile-avatar">${esc(name.split(" ").map(x=>x[0]).join(""))}</div><div><div class="eyebrow">Профиль кандидата · демо-данные</div><h2>${esc(name)}</h2><div class="small muted">${esc(d.title||application.position)} · ${esc(d.city||"Локация не указана")}</div></div></div><div class="profile-stats"><div><span>Опыт</span><strong>${esc(exp)}</strong></div><div><span>Зарплатные ожидания</span><strong>${esc(application?moneyV3(application.salary):d.salary||"Уточняются")}</strong></div><div><span>Источник</span><strong>${esc(cand?.source||"Отклик на платформе")}</strong></div></div><section><h3>О кандидате</h3><p>${esc(d.summary||"Информация будет заполнена из резюме.")}</p></section><section><h3>Опыт работы и компании</h3>${companyList||'<div class="hint">Детальная история работы пока не указана</div>'}</section><section><h3>Ключевые навыки</h3><div class="profile-skill-list">${(d.skills||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div></section><section><h3>Образование</h3><p>${esc(d.education||"Не указано")}</p></section>${application?`<section><h3>Сопроводительное письмо</h3><p>${application.letter?esc(application.letter):"Письмо не приложено"}</p></section>`:""}<section><h3>Дополнительные сведения</h3><div class="req-facts"><div><dt>Статус</dt><dd>${cand?.selected?"Выбран заказчиком":cand?.stage==="shortlist"?"В списке кандидатов":"На рассмотрении"}</dd></div><div><dt>Контакты</dt><dd>${s.role==="customer"?"Доступ регулируется правами заказа":"Доступ по условиям платформы"}</dd></div><div><dt>Согласие на представление</dt><dd>Должно быть подтверждено в рабочей системе</dd></div></div></section><div class="hint">Данные этого профиля демонстрационные и не являются реальным резюме. В продукте будут разделы контактов, файлов, комментариев и истории взаимодействий.</div></div>`;
 const action=cand&&s.role==="customer"&&s.order.sent&&!cand.selected&&s.order.status!=="completed"?btn("Выбрать кандидата",`closeModal();openSelect(${cand.id})`,"primary"):application&&s.role==="executor"&&application.status!=="added"&&application.status!=="rejected"?btn("Добавить в кандидаты",`closeModal();addApplicantV3(${application.id})`,"primary"):"";
 modal(name,content,`${btn("Закрыть","closeModal()")}${action}`);
 document.querySelector(".sp-original-app .modal")?.classList.add("profile-modal");
}

function openAddMenuV3(){
 modal("Добавить кандидата",`<div class="source-options"><button type="button" onclick="openBasePickerV3()"><span>▧</span><div><strong>Из своей базы</strong><small>Выбрать кандидата из сохранённых профилей</small></div><b>›</b></button><button type="button" onclick="closeModal();s.tab='responses';renderMain()"><span>✉</span><div><strong>Из откликов</strong><small>Посмотреть самостоятельные отклики соискателей</small></div><b>›</b></button><button type="button" onclick="openResumeImportV3()"><span>▤</span><div><strong>Загрузить резюме</strong><small>Прикрепить файл и создать карточку кандидата</small></div><b>›</b></button></div>`,btn("Закрыть","closeModal()"));
}

function openBasePickerV3(){
 const items=s.candidates.filter(c=>c.stage==="pool");
 modal("Выбрать из своей базы",`<div class="stack"><div class="hint">Кандидат остаётся в рабочем списке до официальной отправки полного списка кандидатов.</div>${items.length?items.map(c=>`<div class="candidate"><div><strong>${esc(c.name)}</strong><div class="desc">${esc(c.exp)}</div></div>${s.order.sent?"":btn("В список кандидатов",`closeModal();addToShortlist(${c.id})`,"primary")}</div>`).join(""):'<div class="empty">Нет доступных кандидатов для включения</div>'}</div>`,btn("Закрыть","closeModal()"));
}

function openResumeImportV3(){
 modal("Загрузить резюме",`<div class="stack"><label class="field">Файл резюме<input id="resume-file-v3" type="file" accept=".pdf,.doc,.docx,.txt"></label><label class="field">ФИО кандидата<input id="resume-name-v3" placeholder="Например, Иван Иванов"></label><label class="field">Краткая квалификация<input id="resume-exp-v3" placeholder="Опыт, специализация, навыки"></label><div class="hint">В прототипе резюме не анализируется автоматически и не отправляется на сервер. Добавляется тестовая карточка и локальный файл.</div></div>`,`${btn("Отмена","closeModal()")}${btn("Добавить кандидата","importResumeV3()","primary")}`);
}

function importResumeV3(){
 const file=$("resume-file-v3")?.files?.[0],name=$("resume-name-v3")?.value?.trim(),exp=$("resume-exp-v3")?.value?.trim();
 if(!file||!name||!exp)return toast("Выберите файл, укажите ФИО и квалификацию");
 const c={id:s.nextCandidateId++,name,exp,stage:"pool",source:"Загружено резюме",selected:false};
 s.candidates.push(c);s.documents.push({id:Date.now(),name:file.name,type:"Резюме",target:name,date:new Date().toLocaleDateString("ru-RU"),url:URL.createObjectURL(file)});
 addHistory(`Загружено резюме и добавлен кандидат: ${name}`);closeModal();s.tab="pool";renderMain();toast("Кандидат добавлен. Файл доступен в документах текущего сеанса");
}

function closeModalV3(){
 $("modal-back").classList.remove("show","drawer-mode");
 document.querySelector(".sp-original-app .modal")?.classList.remove("profile-modal","doc-modal");
}

function openDocumentMenuV3(){
 modal("Добавить документ",`<div class="source-options"><button type="button" onclick="openAttachDocumentV3()"><span>↑</span><div><strong>Прикрепить файл</strong><small>Добавить PDF, DOCX, изображение или другой документ</small></div><b>›</b></button><button type="button" onclick="openGenerateDocumentV3()"><span>▧</span><div><strong>Сформировать автоматически</strong><small>Заполнить карточку или сопроводительный документ данными кандидата</small></div><b>›</b></button></div><div class="hint" style="margin-top:12px">Генерация и загрузка работают как демонстрация без передачи данных в серверное хранилище.</div>`,btn("Отмена","closeModal()"));
}

function candidateOptionsV3(){return '<option value="">Весь заказ</option>'+s.candidates.filter(c=>c.stage!=="withdrawn").map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");}

function openAttachDocumentV3(){
 modal("Прикрепить файл",`<div class="stack"><label class="field">Выберите файл<input id="project-doc-file-v3" type="file"></label><label class="field">К чему относится<select id="project-doc-target-v3">${candidateOptionsV3()}</select></label><div class="hint">Файл доступен только в текущем браузерном сеансе. Подключения к хранилищу нет.</div></div>`,`${btn("Отмена","closeModal()")}${btn("Прикрепить","attachDocumentV3()","primary")}`);
}

function attachDocumentV3(){
 const file=$("project-doc-file-v3")?.files?.[0],val=$("project-doc-target-v3")?.value;if(!file)return toast("Выберите файл");
 const c=s.candidates.find(x=>String(x.id)===val),target=c?c.name:"Общий документ";
 s.documents.unshift({id:Date.now(),name:file.name,type:"Загруженный файл",target,date:new Date().toLocaleDateString("ru-RU"),url:URL.createObjectURL(file)});
 addHistory(`Прикреплён документ «${file.name}»${c?" для "+c.name:""}`);
 closeModal();renderMain();toast("Документ добавлен в текущий сеанс");
}

function openGenerateDocumentV3(){
 modal("Сформировать документ",`<div class="stack"><label class="field">Шаблон<select id="generated-doc-type-v3"><option value="profile">Карточка кандидата</option><option value="summary">Сопроводительный лист кандидата</option><option value="shortlist">Реестр списка кандидатов</option></select></label><label class="field">Кандидат<select id="generated-doc-candidate-v3">${candidateOptionsV3()}</select></label><div class="hint">Документ сформируется автоматически из демонстрационных данных проекта. Не является юридически значимым документом.</div></div>`,`${btn("Отмена","closeModal()")}${btn("Сформировать","generateDocumentV3()","primary")}`);
}

function generateDocumentV3(){
 const type=$("generated-doc-type-v3").value,cid=$("generated-doc-candidate-v3").value,c=s.candidates.find(x=>String(x.id)===cid);
 if(type!=="shortlist"&&!c)return toast("Выберите кандидата");
 const types={profile:"Карточка кандидата",summary:"Сопроводительный лист",shortlist:"Реестр списка кандидатов"},label=types[type];
 const content=type==="shortlist"?s.candidates.filter(x=>x.stage==="shortlist").map((x,i)=>`${i+1}. ${x.name} — ${x.exp}`).join("\n"): `ФИО: ${c.name}\nКвалификация: ${c.exp}\nИсточник: ${c.source}\nЗаказ: ${s.order.title}\nЗаказчик: ${s.order.customer}`;
 const safe=esc(content).replaceAll("\n","<br>");
 const documentHtml=`<!doctype html><html lang="ru"><meta charset="utf-8"><title>${esc(label)}</title><style>body{font:15px Arial,sans-serif;max-width:760px;margin:60px auto;color:#12201c;line-height:1.65}h1{font-size:25px;border-bottom:3px solid #0f766e;padding-bottom:16px}.meta{color:#6b8077;font-size:12px}.content{padding:24px;background:#f4f8f6;border:1px solid #d7e5df;border-radius:8px}</style><h1>${esc(label)}</h1><p class="meta">SelectProfi · Демонстрационный документ · ${new Date().toLocaleDateString("ru-RU")}</p><div class="content">${safe}</div><p class="meta">Сформировано в демо-прототипе. Не является официальным документом.</p></html>`;
 const url=URL.createObjectURL(new Blob([documentHtml],{type:"text/html;charset=utf-8"}));
 s.documents.unshift({id:Date.now(),name:label+(c?" — "+c.name:"")+".html",type:"Сформирован платформой (демо)",target:c?.name||"Весь список кандидатов",date:new Date().toLocaleDateString("ru-RU"),url});
 addHistory(`Автоматически сформирован документ «${label}»${c?" для "+c.name:""}`);
 closeModal();renderMain();toast("Документ сформирован и доступен для скачивания");
}

function chatMessagesHtmlV3(){
 return `<div class="chat-timeline"><div class="chat-system">Демонстрационная переписка по заказу ${esc(s.order.id)}</div>${s.chatMessages.map(m=>`<div class="chat-line ${m.mine?"mine":""}"><div class="chat-bubble">${esc(m.text)}</div><small>${esc(m.mine?"Вы · "+m.time:"Владимир Ларин · "+m.time)}</small></div>`).join("")}</div>`;
}

function openChatDrawer(){
 ensureV3State();
 const body=chatMessagesHtmlV3();
 const footer=`<div class="chat-input-wrap"><textarea id="drawer-message-v3" placeholder="Написать заказчику…" rows="3"></textarea><button class="btn primary" type="button" onclick="sendChatMessageV3()">Отправить</button></div>`;
 modal("Чат · ООО «Вектор»",body,footer);
 $("modal-back").classList.add("drawer-mode");
 const log=$("modal-body");if(log)log.scrollTop=log.scrollHeight;
}

function sendChatMessageV3(){
 const el=$("drawer-message-v3"),txt=el?.value?.trim();if(!txt)return toast("Введите сообщение");
 s.chatMessages.push({mine:true,time:new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}),text:txt});
 const body=$("modal-body");if(body){body.innerHTML=chatMessagesHtmlV3();body.scrollTop=body.scrollHeight;}if(el)el.value="";
 addHistory("Отправлено сообщение заказчику в демонстрационном чате");toast("Сообщение добавлено в демо-чат");
}
openProfile=openProfileV3;closeModal=closeModalV3;
Object.assign(window,{openProfile,closeModal,openAddMenu:openAddMenuV3,openBasePickerV3,openResumeImportV3,importResumeV3,openDocumentMenuV3,openAttachDocumentV3,attachDocumentV3,openGenerateDocumentV3,generateDocumentV3,openChatDrawer,sendChatMessageV3});


const baseRenderMainV3=renderMain;
renderMain=function(){baseRenderMainV3();if(s.tab==="responses"&&s.role==="executor"){
 const inputs=document.querySelectorAll(".sp-original-app .response-toolbar select");
 const filters=s.responseFilters;
 const values=[filters.experience,filters.location,filters.skills,filters.status,filters.sort];
 for(let i=0;i<inputs.length;i++)inputs[i].value=values[i];
 const checkbox=document.querySelector(".sp-original-app .response-summary input[type=checkbox]");
 if(checkbox)checkbox.checked=!!filters.letter;
 }};
window.renderMain=renderMain;
function filterCountV4(){let f=s.responseFilters;return ["experience","location","skills","status"].filter(x=>f[x]!=="all").length+Number(f.letter)+Number(f.sort!=="relevance");}

function renderResponsesV4(){
 const n=filterCountV4();
 const terms=[s.responseFilters.experience!=="all"?"Опыт от "+s.responseFilters.experience+" лет":"",s.responseFilters.location!=="all"?s.responseFilters.location:"",s.responseFilters.skills!=="all"?"Навык "+s.responseFilters.skills:"",s.responseFilters.letter?"С письмом":"",s.responseFilters.status!=="all"?({"new":"Новые","added":"Добавленные","rejected":"Отклонённые"}[s.responseFilters.status]||""):"",s.responseFilters.sort!=="relevance"?"Изменена сортировка":""].filter(Boolean);
 return `<div class="panel responses-panel"><div class="section-toolbar"><div><h3>Отклики соискателей</h3><p class="small muted">Самостоятельные отклики кандидатов с платформы</p></div><span class="tag">${s.applications.length} откликов</span></div><div class="response-search-line-v4"><div class="response-search-input-v4"><span class="badge-icon">search</span><input type="search" placeholder="Поиск по имени, навыкам или компаниям" value="${esc(s.responseFilters.search)}" oninput="setResponseFilterV3('search',this.value)"></div><button class="btn ${n?"filter-selected-v4":""}" onclick="openResponseFiltersV4()">☷ Фильтры${n?` <span class="filter-count-v4">${n}</span>`:""}</button></div><div class="response-filter-summary-v4"><span class="small muted" id="response-count">Откликов: ${s.applications.length}</span><div>${terms.map(x=>`<span class="filter-tag-v4">${esc(x)}</span>`).join("")}${n?'<button class="filter-reset-v4" onclick="resetAppliedFiltersV4()">Сбросить</button>':""}</div></div><div id="response-list" class="responses-list">${renderResponseCardsV3()}</div></div>`;
}

function filterSelectV4(key,title,data){
 const current=s.tmpFiltersV4[key];
 return `<label class="field">${title}<select onchange="s.tmpFiltersV4['${key}']=this.value">${data.map(([v,t])=>`<option value="${esc(v)}" ${v===current?"selected":""}>${esc(t)}</option>`).join("")}</select></label>`;
}

function openResponseFiltersV4(keep=false){
 if(!keep||!s.tmpFiltersV4)s.tmpFiltersV4={...s.responseFilters};
 const f=s.tmpFiltersV4;
 const fields=[
  filterSelectV4("experience","Опыт",[["all","Любой"],["3","От 3 лет"],["5","От 5 лет"],["7","От 7 лет"]]),
  filterSelectV4("location","Город",[["all","Все города"],["Москва","Москва"],["Санкт-Петербург","Санкт-Петербург"],["Казань","Казань"]]),
  filterSelectV4("skills","Навыки",[["all","Все навыки"],["B2B","B2B"],["CRM","CRM"],["Переговоры","Переговоры"],["Тендеры","Тендеры"]]),
  filterSelectV4("status","Статус",[["all","Все отклики"],["new","Новые"],["added","Добавлены"],["rejected","Отклонены"]]),
  filterSelectV4("sort","Сортировка",[["relevance","По релевантности"],["date","По дате"],["experience","По опыту"]])
 ].join("");
 modal("Фильтры откликов",`<div class="filter-dialog-v4"><p class="small muted">Настройте отбор соискателей. Фильтры применятся после подтверждения.</p><div class="filter-dialog-grid-v4">${fields}</div><label class="checkbox-row filter-checkbox-v4"><input type="checkbox" ${f.letter?"checked":""} onchange="s.tmpFiltersV4.letter=this.checked"> Только с сопроводительным письмом</label></div>`,`${btn("Очистить","clearDialogFiltersV4()")}${btn("Отмена","closeModal()")}${btn("Показать отклики","applyDialogFiltersV4()","primary")}`);
}

function clearDialogFiltersV4(){s.tmpFiltersV4={...s.responseFilters,experience:"all",location:"all",skills:"all",status:"all",letter:false,sort:"relevance"};openResponseFiltersV4(true);}

function applyDialogFiltersV4(){s.responseFilters={...s.responseFilters,...s.tmpFiltersV4};closeModal();renderMain();}

function resetAppliedFiltersV4(){s.responseFilters={...s.responseFilters,experience:"all",location:"all",skills:"all",status:"all",letter:false,sort:"relevance"};renderMain();}

function renderResponseListV4(){
 const container=$("response-list");if(!container)return;
 container.innerHTML=renderResponseCardsV3();
 const n=container.querySelectorAll(".applicant-card").length;const count=$("response-count");if(count)count.textContent="Откликов: "+n;
}

function vacancySeedV4(){return {
 title:"Менеджер по продажам B2B",company:"Компания из B2B-сферы",city:"Москва",format:"Офис / гибрид (уточняется)",salary:"от 120 000 ₽ + бонусы",employment:"Полная занятость, 5/2",
 summary:"Ищем специалиста по корпоративным продажам. Важны самостоятельность, навыки переговоров и ориентация на результат.",
 duties:"Поиск и развитие корпоративных клиентов\nПроведение встреч и презентаций\nРабота в CRM и сопровождение сделок\nВыполнение плана продаж",
 required:"Опыт B2B-продаж от 3 лет\nВладение CRM (например, Bitrix24)\nПереговоры с ЛПР\nОпыт ведения полного цикла сделки",
 optional:"Опыт продажи IT-сервисов или SaaS\nУчастие в тендерах\nАналитика продаж",
 offer:"Оформление по ТК РФ (условия уточняются)\nМотивация: оклад и бонусы\nВозможности профессионального роста",
 contact:"Отклик через платформу SelectProfi",
 internal:"Уточнить у заказчика бонусную схему и возможность гибрида. Не включать эти заметки в объявление."
};}

function makeJobV4(){if(s.role!=="executor")return toast("Редактор доступен исполнителю");if(!s.jobDraftV4){s.jobDraftV4=vacancySeedV4();s.jobSavedV4="";s.jobDirtyV4=true;addHistory("Исполнитель создал черновик вакансии для поиска соискателей");}renderMain();}

function jobFieldV4(key,label,large=false){
 const value=esc(s.jobDraftV4[key]||"");
 return `<label class="field">${esc(label)}${large?`<textarea rows="4" oninput="editJobV4('${key}',this.value)">${value}</textarea>`:`<input value="${value}" oninput="editJobV4('${key}',this.value)">`}</label>`;
}

function jobPreviewV4(){
 const x=s.jobDraftV4,li=t=>(t||"").split(/\n/).map(v=>v.trim()).filter(Boolean).map(v=>`<li>${esc(v)}</li>`).join("");
 const section=(label,text)=>text?.trim()?`<section class="job-preview-section-v4"><h4>${label}</h4><ul>${li(text)}</ul></section>`:"";
 return `<div class="eyebrow">Предпросмотр объявления</div><h2>${esc(x.title||"Без названия")}</h2><p class="job-company-v4">${esc(x.company)} · ${esc(x.city)}</p><div class="job-badges-v4"><span>${esc(x.format)}</span><span>${esc(x.salary)}</span><span>${esc(x.employment)}</span></div><section class="job-preview-section-v4"><h4>О вакансии</h4><p>${esc(x.summary)}</p></section>${section("Задачи",x.duties)}${section("Обязательные требования",x.required)}${section("Будет плюсом",x.optional)}${section("Условия",x.offer)}<section class="job-preview-section-v4"><h4>Как откликнуться</h4><p>${esc(x.contact)}</p></section><p class="job-preview-foot-v4">Предварительный текст исполнителя · не опубликован</p>`;
}

function renderJobV4(){
 if(!s.jobDraftV4)return `<div class="panel job-empty-v4"><div class="job-empty-icon-v4">▤</div><div class="eyebrow">Инструмент исполнителя</div><h3>Моя предварительная вакансия</h3><p>По принятому заказу создайте свою понятную вакансию для поиска соискателей. Исходные требования заказчика не изменятся. Можно отредактировать формулировки и выгрузить объявление в текстовом формате или PDF.</p><div class="hint">Не публикуйте внутренние условия и обещания, не подтверждённые заказчиком.</div><div class="rowx wrap">${btn("Составить вакансию","makeJobV4()","primary")}${btn("Требования заказчика","s.tab='requirements';renderMain()")}</div></div>`;
 const x=s.jobDraftV4;
 return `<div class="job-v4"><div class="job-top-v4"><div><div class="eyebrow">Вакансия исполнителя · только черновик</div><h3>${esc(x.title)}</h3><small id="job-save-status-v4" class="muted">${s.jobDirtyV4?"Есть несохранённые изменения":s.jobSavedV4?"Сохранено "+s.jobSavedV4:"Не сохранено"}</small></div><div class="rowx wrap">${btn("Сохранить","saveJobV4()","primary")}${btn("Скачать TXT","downloadJobTxtV4()")}${btn("PDF / печать","printJobPdfV4()")}</div></div><div class="job-grid-v4"><section class="panel job-editor-v4"><div class="section-toolbar"><h3>Редактор объявления</h3><button class="btn ghost" onclick="s.tab='requirements';renderMain()">Требования заказчика ›</button></div><div class="job-fields-two-v4">${jobFieldV4("title","Должность")}${jobFieldV4("company","Работодатель в объявлении")}${jobFieldV4("city","Город")}${jobFieldV4("format","Формат работы")}${jobFieldV4("salary","Зарплата")}${jobFieldV4("employment","Занятость")}</div>${jobFieldV4("summary","Описание вакансии",true)}${jobFieldV4("duties","Задачи (с новой строки)",true)}${jobFieldV4("required","Обязательные требования",true)}${jobFieldV4("optional","Будет плюсом",true)}${jobFieldV4("offer","Что предлагаем",true)}${jobFieldV4("contact","Как откликнуться",true)}<div class="job-internal-v4">${jobFieldV4("internal","Внутренние заметки — не включать в экспорт",true)}<small>В TXT и PDF эти заметки не попадут.</small></div></section><aside class="job-preview-column-v4"><div class="rowx between" style="margin-bottom:10px"><strong>Как увидит соискатель</strong><span class="tag gray">Не опубликовано</span></div><article id="job-preview-v4" class="job-preview-paper-v4">${jobPreviewV4()}</article><div class="hint" style="margin-top:10px">Для PDF откроется окно печати: выберите «Сохранить как PDF».</div></aside></div></div>`;
}

function editJobV4(key,value){
 if(!s.jobDraftV4)return;s.jobDraftV4[key]=value;s.jobDirtyV4=true;
 const p=$("job-preview-v4");if(p)p.innerHTML=jobPreviewV4();
 const st=$("job-save-status-v4");if(st)st.textContent="Есть несохранённые изменения";
}

function saveJobV4(){
 if(!s.jobDraftV4?.title?.trim()||!s.jobDraftV4?.required?.trim())return toast("Заполните должность и обязательные требования");
 s.jobDirtyV4=false;s.jobSavedV4=new Date().toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
 addHistory("Исполнитель сохранил предварительную вакансию");const st=$("job-save-status-v4");if(st)st.textContent="Сохранено "+s.jobSavedV4;toast("Черновик сохранён в этом демо-сеансе");
}

function jobPlainV4(){
 const x=s.jobDraftV4;const points=t=>(t||"").split("\n").filter(Boolean).map(v=>"• "+v).join("\n");
 return [x.title,"",x.company,x.city,x.format,x.employment,x.salary,"","О ВАКАНСИИ",x.summary,"","ЗАДАЧИ",points(x.duties),"","ТРЕБОВАНИЯ",points(x.required),"","БУДЕТ ПЛЮСОМ",points(x.optional),"","УСЛОВИЯ",points(x.offer),"","КАК ОТКЛИКНУТЬСЯ",x.contact].join("\n");
}

function downloadJobTxtV4(){
 if(!s.jobDraftV4?.title?.trim())return toast("Заполните название вакансии");
 const url=URL.createObjectURL(new Blob(["\ufeff"+jobPlainV4()],{type:"text/plain;charset=utf-8"}));const el=document.createElement("a");el.href=url;el.download="vakansiya-"+s.order.id+".txt";document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast("TXT-файл подготовлен");
}

function printJobPdfV4(){
 if(!s.jobDraftV4?.title?.trim())return toast("Заполните название вакансии");
 document.getElementById("job-print-v4")?.remove();const wrap=document.createElement("article");wrap.id="job-print-v4";wrap.innerHTML=jobPreviewV4();document.body.appendChild(wrap);document.body.classList.add("sp-job-print-v4");
 const cleanup=()=>{document.body.classList.remove("sp-job-print-v4");wrap.remove();window.removeEventListener("afterprint",cleanup)};
 window.addEventListener("afterprint",cleanup);try{window.print()}catch(e){cleanup();toast("Не удалось открыть печать")};
}

function requirementsWithLinkV4(){return renderRequirementsV3()+`<div class="job-from-requirements-v4"><div><strong>Вакансия для поиска соискателей</strong><p>Отдельный черновик исполнителя — редактирование не меняет требования заказчика.</p></div>${btn(s.jobDraftV4?"Открыть мою вакансию":"Создать свою вакансию","s.tab='job';renderMain()","primary")}</div>`;}
renderResponseListV3=renderResponseListV4;
renderRequirements=requirementsWithLinkV4;
Object.assign(window,{openResponseFiltersV4,clearDialogFiltersV4,applyDialogFiltersV4,resetAppliedFiltersV4,makeJobV4,editJobV4,saveJobV4,downloadJobTxtV4,printJobPdfV4,renderRequirements});

function ensureCandidatePageV5(){
 if(s.candidateBaseV5)return;
 s.candidateBaseV5=[
  {id:501,name:"Игорь Лебедев",title:"Менеджер по развитию B2B",years:3,city:"Москва",skills:["B2B","Поиск клиентов","Дистрибуция"],company:"ООО «Меридиан»",history:["ООО «Меридиан» — менеджер по развитию (2023–2026)","ООО «Акцент» — специалист по продажам (2022–2023)"],description:"Поиск корпоративных клиентов, исходящие коммуникации, подготовка предложений и работа с существующей клиентской базой.",expectations:"от 115 000 ₽",experience:"3 года · холодные звонки, дистрибуция"},
  {id:502,name:"Светлана Ким",title:"Менеджер оптовых продаж",years:5,city:"Москва",skills:["FMCG","Переговоры","Оптовые продажи"],company:"ООО «Гранд Трейд»",history:["ООО «Гранд Трейд» — ведущий менеджер (2021–2026)"],description:"Развитие дистрибьюторской сети, работа с поставщиками и корпоративными покупателями.",expectations:"от 140 000 ₽",experience:"5 лет · FMCG, оптовые продажи"},
  {id:503,name:"Виктория Андреева",title:"Менеджер корпоративных продаж",years:6,city:"Москва",skills:["B2B","Bitrix24","SaaS","Презентации"],company:"ООО «Вектор ИТ»",history:["ООО «Вектор ИТ» — старший менеджер (2022–2026)","ООО «Контакт» — менеджер (2020–2022)"],description:"Шесть лет в продажах корпоративного ПО, демонстрации, работа с ЛПР и длинные сделки.",expectations:"от 165 000 ₽",experience:"6 лет · B2B, CRM, SaaS"},
  {id:504,name:"Максим Павлов",title:"Специалист по продажам",years:4,city:"Санкт-Петербург",skills:["B2B","amoCRM","Тендеры"],company:"АО «Промлайн»",history:["АО «Промлайн» — менеджер B2B (2022–2026)"],description:"Работал с промышленными заказчиками, развивал воронку и участвовал в подготовке тендерных предложений.",expectations:"от 130 000 ₽",experience:"4 года · B2B, тендеры, amoCRM"},
  {id:505,name:"Кирилл Демидов",title:"Аккаунт-менеджер",years:7,city:"Казань",skills:["Key Account","Переговоры","CRM","FMCG"],company:"ООО «Терра»",history:["ООО «Терра» — ключевые клиенты (2021–2026)","ООО «Партнёр» — менеджер (2019–2021)"],description:"Семь лет в развитии корпоративных клиентов, умеет вести переговоры и удерживать крупные аккаунты.",expectations:"от 145 000 ₽",experience:"7 лет · Key Account, B2B"},
  {id:506,name:"Дарья Жукова",title:"Менеджер по продажам IT-продуктов",years:5,city:"Москва",skills:["IT","CRM","B2B","Аналитика"],company:"ООО «Смарт Системы»",history:["ООО «Смарт Системы» — менеджер по продажам (2021–2026)"],description:"Опыт продаж подписочных сервисов, квалификации лидов, проведения презентаций и ведения CRM.",expectations:"от 150 000 ₽",experience:"5 лет · B2B, IT-продукты"},
  {id:507,name:"Павел Орехов",title:"Менеджер B2B-сервисов",years:2,city:"Москва",skills:["B2B","Сервисы","Переговоры"],company:"ООО «Идея»",history:["ООО «Идея» — менеджер (2024–2026)"],description:"Работает с бизнес-клиентами, представляет продукты и сопровождает сделки.",expectations:"от 110 000 ₽",experience:"2 года · B2B-продажи сервисов"}
 ];
 s.candidateSourceV5="base";s.baseQueryV5="";s.baseStatusV5="all";s.resumeFeedbackV5="";
}

function openCandidatePageV5(tab="base"){
 if(s.role!=="executor")return toast("Добавлять кандидатов в заказ может только назначенный исполнитель");
 ensureCandidatePageV5();
 s.candidateSourceV5=["base","responses","resume"].includes(tab)?tab:"base";
 s.screen="addCandidate";s.detailOpen=true;closeModal();render();
}

function backToProjectV5(){
 s.screen="project";s.detailOpen=true;s.tab="pool";render();
}

function chooseCandidateSourceV5(tab){
 if(!["base","responses","resume"].includes(tab))return;
 s.candidateSourceV5=tab;renderMain();
}

function basePersonInProjectV5(profile){return s.candidates.some(x=>x.baseCandidateId===profile.id||x.name===profile.name);}

function renderBaseListV5(){
 ensureCandidatePageV5();
 const q=s.baseQueryV5.toLowerCase().trim();
 const list=s.candidateBaseV5.filter(p=>(!q||[p.name,p.title,p.city,p.company,p.experience,...p.skills].join(" ").toLowerCase().includes(q))&&(s.baseStatusV5==="all"||(s.baseStatusV5==="available"?!basePersonInProjectV5(p):basePersonInProjectV5(p))));
 return `<div class="add-base-summary-v5"><strong id="base-count-v5">${list.length} профилей</strong><span class="small muted">Профили из собственной базы · тестовые данные</span></div><div class="add-base-grid-v5">${list.map(p=>`<article class="add-person-v5"><div class="add-person-head-v5"><div class="add-person-avatar-v5">${esc(p.name.split(" ").map(t=>t[0]).join(""))}</div><div><strong>${esc(p.name)}</strong><div class="small muted">${esc(p.title)}</div></div><span class="tag ${basePersonInProjectV5(p)?"green":"gray"}">${basePersonInProjectV5(p)?"В проекте":"В базе"}</span></div><div class="add-person-facts-v5"><span>◷ ${p.years} лет опыта</span><span>⌖ ${esc(p.city)}</span><span>${esc(p.company)}</span></div><div class="add-person-skills-v5">${p.skills.map(x=>`<span>${esc(x)}</span>`).join("")}</div><div class="add-person-actions-v5"><button class="btn" onclick="openBaseProfileV5(${p.id})">Профиль</button>${basePersonInProjectV5(p)?'<span class="add-already-v5">✓ Уже добавлен</span>':`<button class="btn primary" onclick="addBaseCandidateV5(${p.id})">Добавить в проект</button>`}</div></article>`).join("")||'<div class="empty">Подходящих кандидатов не найдено. Сбросьте поиск или фильтр.</div>'}</div>`;
}

function renderBaseSourceV5(){
 return `<section class="panel add-source-panel-v5"><div class="section-toolbar"><div><h3>Моя база кандидатов</h3><p class="small muted">Выберите сохранённый профиль и добавьте кандидата к текущему заказу</p></div></div><div class="add-base-tools-v5"><label class="add-source-search-v5"><span class="badge-icon">search</span><input value="${esc(s.baseQueryV5)}" type="search" placeholder="Имя, навыки, компания или город" oninput="setBaseQueryV5(this.value)" aria-label="Поиск по своей базе"></label><select aria-label="Фильтр по добавлению" onchange="setBaseStatusV5(this.value)"><option value="all" ${s.baseStatusV5==="all"?"selected":""}>Все профили</option><option value="available" ${s.baseStatusV5==="available"?"selected":""}>Не добавлены</option><option value="added" ${s.baseStatusV5==="added"?"selected":""}>Уже в проекте</option></select></div><div id="add-base-results-v5">${renderBaseListV5()}</div></section>`;
}

function setBaseQueryV5(text){s.baseQueryV5=text;const p=$("add-base-results-v5");if(p)p.innerHTML=renderBaseListV5();}

function setBaseStatusV5(value){s.baseStatusV5=value;const p=$("add-base-results-v5");if(p)p.innerHTML=renderBaseListV5();}

function openBaseProfileV5(id){
 const p=s.candidateBaseV5.find(x=>x.id===id);if(!p)return toast("Профиль не найден");
 const blocks=p.history.map((h,i)=>`<div class="profile-job"><span class="job-dot">${i+1}</span><div><strong>${esc(h)}</strong><small>Опыт из тестового профиля</small></div></div>`).join("");
 modal("Профиль · "+p.name,`<div class="profile-card"><div class="profile-identity"><div class="profile-avatar">${esc(p.name.split(" ").map(t=>t[0]).join(""))}</div><div><div class="eyebrow">Ваша база кандидатов</div><h2>${esc(p.name)}</h2><p class="small muted">${esc(p.title)} · ${esc(p.city)}</p></div></div><div class="profile-stats"><div><span>Опыт работы</span><strong>${p.years} лет</strong></div><div><span>Зарплатные ожидания</span><strong>${esc(p.expectations)}</strong></div><div><span>Источник</span><strong>Моя база</strong></div></div><section><h3>О кандидате</h3><p>${esc(p.description)}</p></section><section><h3>Компании и опыт</h3>${blocks}</section><section><h3>Навыки</h3><div class="profile-skill-list">${p.skills.map(x=>`<span>${esc(x)}</span>`).join("")}</div></section><div class="hint">Демонстрационный профиль. Проверка согласия кандидата требуется в рабочей версии.</div></div>`,`${btn("Закрыть","closeModal()")}${basePersonInProjectV5(p)?"":btn("Добавить в проект",`closeModal();addBaseCandidateV5(${p.id})`,"primary")}`);
 document.querySelector(".sp-original-app .modal")?.classList.add("profile-modal");
}

function addBaseCandidateV5(id){
 const p=s.candidateBaseV5.find(x=>x.id===id);if(!p)return;
 if(basePersonInProjectV5(p))return toast("Кандидат уже есть в проекте");
 s.candidates.push({id:s.nextCandidateId++,baseCandidateId:p.id,name:p.name,exp:p.experience,stage:"pool",selected:false,source:"Моя база"});
 addHistory(`Кандидат ${p.name} добавлен в проект из своей базы`);
 renderMain();toast(`${p.name} добавлен в кандидаты проекта`);
}

function renderResumeSourceV5(){
 return `<div class="add-resume-grid-v5"><section class="panel add-resume-form-v5"><div class="section-toolbar"><div><h3>Загрузить резюме</h3><p class="small muted">Создайте карточку кандидата и прикрепите файл к проекту</p></div></div><div class="add-upload-zone-v5"><div class="add-upload-icon-v5">▤</div><label for="candidate-resume-file-v5"><strong>Выберите файл резюме</strong><span>PDF, DOC, DOCX или TXT</span></label><input id="candidate-resume-file-v5" type="file" accept=".pdf,.doc,.docx,.txt" onchange="showResumeFileV5()"><div id="add-file-name-v5" class="small muted">Файл пока не выбран</div></div><div class="add-resume-fields-v5"><label class="field">Фамилия и имя кандидата <input id="candidate-name-v5" placeholder="Например, Иван Иванов" autocomplete="off"></label><label class="field">Опыт и квалификация <textarea id="candidate-exp-v5" rows="3" placeholder="Например, 5 лет в B2B-продажах, CRM, переговоры"></textarea></label><label class="field">Источник / комментарий <input id="candidate-note-v5" placeholder="Например, собственная база или рекомендация"></label></div><div class="hint">В демонстрационном макете данные из файла автоматически не распознаются. Информация в карточке вводится вручную; реальной загрузки на сервер нет.</div><div class="add-resume-submit-v5">${btn("Создать карточку кандидата","saveResumeCandidateV5()","primary")}${btn("К кандидатам проекта","backToProjectV5()")}</div></section><aside class="add-resume-advice-v5"><h3>Что произойдёт после добавления</h3><div><span>1</span><p>Создадим кандидата в рабочем списке проекта.</p></div><div><span>2</span><p>Прикрепим резюме к его документам в текущем демо-сеансе.</p></div><div><span>3</span><p>После проверки кандидат сможет попасть в список для заказчика.</p></div><p class="small muted">Заказчик не увидит нового кандидата до официальной отправки полного списка.</p></aside></div>`;
}

function showResumeFileV5(){
 const file=$("candidate-resume-file-v5")?.files?.[0],label=$("add-file-name-v5");
 if(label)label.textContent=file?file.name+" · "+Math.max(1,Math.ceil(file.size/1024))+" КБ":"Файл пока не выбран";
}

function saveResumeCandidateV5(){
 const file=$("candidate-resume-file-v5")?.files?.[0],name=$("candidate-name-v5")?.value?.trim(),exp=$("candidate-exp-v5")?.value?.trim();
 const note=$("candidate-note-v5")?.value?.trim();
 if(!file)return toast("Выберите файл резюме");
 if(!name||!exp)return toast("Укажите ФИО и опыт кандидата");
 if(!/\.(pdf|doc|docx|txt)$/i.test(file.name))return toast("Поддерживаются PDF, DOC, DOCX и TXT");
 if(s.candidates.some(c=>c.name.toLowerCase()===name.toLowerCase()))return toast("Кандидат с таким ФИО уже есть в проекте");
 const id=s.nextCandidateId++;
 s.candidates.push({id,name,exp,stage:"pool",selected:false,source:note||"Загружено резюме"});
 s.documents.unshift({id:Date.now(),name:file.name,type:"Резюме",target:name,date:new Date().toLocaleDateString("ru-RU"),url:URL.createObjectURL(file)});
 addHistory(`Добавлен кандидат ${name} и прикреплено резюме`);
 s.resumeFeedbackV5=name;s.candidateSourceV5="base";renderMain();toast(`${name} добавлен в проект`);
}

function renderAddCandidateV5(){
 ensureCandidatePageV5();
 const tabs=[["base","Из своей базы","▧"],["responses","Из откликов","✉"],["resume","Загрузить резюме","▤"]];
 const active=s.candidateSourceV5;
 const body=active==="base"?renderBaseSourceV5():active==="responses"?renderResponsesV4():renderResumeSourceV5();
 return `<div class="add-candidate-page-v5"><nav class="project-breadcrumbs add-breadcrumbs-v5" aria-label="Хлебные крошки"><button onclick="closeDetail()">Мои проекты в работе</button><span>›</span><button onclick="backToProjectV5()">${esc(s.order.id)} · ${esc(s.order.title)}</button><span>›</span><strong>Добавить кандидата</strong></nav><div class="add-candidate-heading-v5"><div><div class="eyebrow">Подбор персонала · ${esc(s.order.id)}</div><h1>Добавить кандидата</h1><p>Выберите источник, чтобы добавить человека в рабочую базу проекта. Заказчику кандидаты будут представлены только полным согласованным списком.</p></div><button title="Вернуться к проекту" aria-label="Закрыть страницу добавления" class="add-page-close-v5" onclick="backToProjectV5()">×</button></div><div class="add-candidate-counts-v5"><span><strong>${s.candidates.filter(c=>c.stage!=="withdrawn").length}</strong> кандидатов в проекте</span><span class="add-count-separator-v5"></span><span><strong>${count()} из ${s.order.shortlistCount}</strong> готово для заказчика</span></div><div class="add-candidate-tabs-v5" role="tablist" aria-label="Источник кандидата">${tabs.map(([k,label,icon])=>`<button role="tab" aria-selected="${active===k}" class="add-source-tab-v5 ${active===k?"active":""}" onclick="chooseCandidateSourceV5('${k}')"><span class="add-tab-symbol-v5">${icon}</span><strong>${label}</strong></button>`).join("")}</div><div role="tabpanel" class="add-candidate-content-v5">${body}</div>${s.resumeFeedbackV5?`<div class="add-success-v5" role="status">✓ ${esc(s.resumeFeedbackV5)} добавлен в проект. Найдите его во вкладке «Кандидаты».</div>`:""}</div>`;
}
const originalAddApplicantV5=addApplicantV3;
addApplicantV3=function(id){const onAddScreen=s.screen==="addCandidate";originalAddApplicantV5(id);if(onAddScreen){s.screen="addCandidate";s.detailOpen=true;s.candidateSourceV5="responses";render();}};
const originalRenderMainV5=renderMain;
renderMain=function(){
 const container=$("panes");
 if(s.screen==="addCandidate"){container?.classList.add("add-candidate-layout-v5");const main=$("main");if(main)main.innerHTML=renderAddCandidateV5();return;}
 container?.classList.remove("add-candidate-layout-v5");originalRenderMainV5();
};
openAddCandidate=openCandidatePageV5;
Object.assign(window,{openAddCandidate:openCandidatePageV5,openAddMenu:openCandidatePageV5,openBasePickerV3:()=>openCandidatePageV5("base"),openResumeImportV3:()=>openCandidatePageV5("resume"),backToProjectV5,chooseCandidateSourceV5,setBaseQueryV5,setBaseStatusV5,openBaseProfileV5,addBaseCandidateV5,showResumeFileV5,saveResumeCandidateV5,addApplicantV3,renderMain});

const hotkeys=e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('search')?.focus()}};document.addEventListener('keydown',hotkeys);render();hydrateIcons();return ()=>{document.removeEventListener('keydown',hotkeys);iconObserver.disconnect()};

}
