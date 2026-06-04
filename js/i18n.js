/**
 * i18n.js — Salve Comida bilingual support (PT / EN)
 */
var I18n = (function() {

  var _lang = localStorage.getItem('sc_lang') ||
    ((navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en');

  var _t = {
    pt: {
      /* ── Navbar ── */
      'nav.home': 'Início', 'nav.donate': 'Doar', 'nav.receive': 'Receber',
      'nav.map': 'Mapa', 'nav.explore': 'Explorar', 'nav.impact': 'Impacto',
      'nav.ongs': 'ONGs', 'nav.about': 'Sobre', 'nav.contact': 'Contato',
      'nav.myAccount': 'Minha Conta', 'nav.myDonations': 'Minhas Doações',
      'nav.requests': 'Solicitações', 'nav.profile': 'Perfil',
      'nav.login': 'Entrar', 'nav.register': 'Criar conta', 'nav.logout': 'Sair',
      'nav.langToggle': 'EN',

      /* ── Botões comuns ── */
      'btn.save': 'Salvar alterações', 'btn.cancel': 'Cancelar', 'btn.send': 'Enviar',
      'btn.clear': 'Limpar', 'btn.back': 'Voltar', 'btn.confirm': 'Confirmar',
      'btn.login': 'Entrar', 'btn.register': 'Criar minha conta',
      'btn.postDonation': 'Cadastrar Doação', 'btn.request': 'Solicitar',
      'btn.accept': 'Aceitar', 'btn.reject': 'Recusar', 'btn.complete': 'Finalizar',
      'btn.cancelRequest': 'Cancelar solicitação', 'btn.viewDonation': 'Ver doação',
      'btn.sendRequest': 'Enviar Solicitação', 'btn.viewAll': 'Ver todos os alimentos →',
      'btn.wantDonate': 'Quero Doar Agora', 'btn.viewAvailable': 'Ver Disponíveis',
      'btn.locateMe': 'Usar minha localização',

      /* ── Status ── */
      'status.available': 'Disponível', 'status.reserved': 'Reservado',
      'status.completed': 'Concluído', 'status.cancelled': 'Cancelado',
      'status.pending': 'Pendente', 'status.accepted': 'Aceito', 'status.rejected': 'Recusado',

      /* ── Categorias ── */
      'cat.fruits': 'Frutas e verduras', 'cat.breads': 'Pães e massas',
      'cat.meals': 'Refeições prontas', 'cat.canned': 'Enlatados',
      'cat.dairy': 'Laticínios', 'cat.drinks': 'Bebidas', 'cat.other': 'Outros',

      /* ── Labels de formulário ── */
      'label.name': 'Nome', 'label.email': 'E-mail', 'label.password': 'Senha',
      'label.confirmPassword': 'Confirmar senha', 'label.phone': 'Telefone / WhatsApp',
      'label.city': 'Cidade', 'label.state': 'Estado', 'label.address': 'Endereço',
      'label.category': 'Categoria', 'label.quantity': 'Quantidade',
      'label.unit': 'Tipo / embalagem', 'label.description': 'Descrição',
      'label.expiryDate': 'Data limite para retirada', 'label.delivery': 'Opção de entrega',
      'label.street': 'Rua / Avenida', 'label.number': 'Número',
      'label.complement': 'Complemento', 'label.notes': 'Observações adicionais',
      'label.photo': 'Foto do alimento', 'label.optional': '(opcional)',
      'label.profile': 'Perfil', 'label.role': 'Tipo de conta',
      'label.maxPerRequest': 'Limite por solicitação',
      'label.subject': 'Assunto', 'label.message': 'Mensagem',
      'label.pickupLocation': 'Local de retirada',
      'label.requestQty': 'Quantidade solicitada',
      'label.requestDate': 'Data da solicitação',
      'label.donationStatus': 'Status da doação',
      'label.receiverCity': 'Cidade',
      'label.receiverAddress': 'Endereço do receptor',
      'label.requestedBy': 'Solicitação de:',
      'label.donor': 'Doador:',
      'label.shareAddress': 'Compartilhar meu endereço com o doador após a solicitação ser aceita',
      'label.shareAddressHint': 'Se ativado, seu endereço de perfil será visível para o doador somente após o aceite. Telefone e e-mail nunca são compartilhados.',

      /* ── Placeholders ── */
      'ph.name': 'Nome completo', 'ph.email': 'seu@email.com',
      'ph.password': 'Mínimo 6 caracteres', 'ph.confirmPassword': 'Repita a senha',
      'ph.phone': '+55 11 99999-0000', 'ph.city': 'Digite para buscar...',
      'ph.street': 'Ex: Rua das Flores', 'ph.number': 'Ex: 45',
      'ph.foodName': 'Ex: Pães variados', 'ph.qty': 'Ex: 10',
      'ph.unit': 'Ex: pacotes de 1kg, latas, kg', 'ph.maxQty': 'Ex: 2',
      'ph.description': 'Descreva o alimento, condição, origem, etc.',
      'ph.notes': 'Horário de retirada, informações extras, etc.',
      'ph.message': 'Escreva sua mensagem aqui...',
      'ph.requestMessage': 'Mensagem para o doador (opcional)',
      'ph.search': 'Buscar alimentos...', 'ph.location': 'Filtrar por cidade...',

      /* ── Páginas — títulos e tags ── */
      'home.tag': 'Plataforma de Doação de Alimentos',
      'home.hero.title': 'Compartilhe mais,\ndesperdice menos.',
      'home.hero.desc': 'Conectamos doadores de alimentos a pessoas que precisam. Padarias, restaurantes, mercados e cidadãos — juntos, construindo uma comunidade mais solidária.',
      'home.howWorks.tag': 'Como funciona',
      'home.howWorks.title': 'Simples, rápido e solidário',
      'home.howWorks.desc': 'Em poucos passos, você conecta alimentos que seriam desperdiçados a pessoas que precisam.',
      'home.step1.title': 'Cadastre a doação', 'home.step1.desc': 'Doadores preenchem um formulário com os dados dos alimentos disponíveis.',
      'home.step2.title': 'Comunidade visualiza', 'home.step2.desc': 'Qualquer pessoa pode ver os alimentos disponíveis, filtrar por categoria e localização.',
      'home.step3.title': 'Solicite o alimento', 'home.step3.desc': 'O usuário faz uma solicitação informando seus dados e a quantidade desejada.',
      'home.step4.title': 'Combine a retirada', 'home.step4.desc': 'Doador e receptor combinam retirada ou entrega diretamente pelo contato informado.',
      'home.benefits.tag': 'Por que participar', 'home.benefits.title': 'Benefícios para todos',
      'home.cta.title': 'Tem alimento sobrando?',
      'home.cta.desc': 'Evite o desperdício. Cadastre sua doação agora e ajude alguém próximo de você.',
      'home.recent.tag': 'Disponíveis agora', 'home.recent.title': 'Alimentos esperando por você',

      /* ── Login / Cadastro ── */
      'login.title': 'Entrar na sua conta', 'login.sub': 'Bem-vindo de volta!',
      'login.forgot': 'Esqueci minha senha', 'login.noAccount': 'Não tem conta?',
      'login.createAccount': 'Criar conta grátis',
      'register.title': 'Criar conta', 'register.sub': 'Junte-se à comunidade Salve Comida',
      'register.roleLabel': 'Qual é o seu perfil?',
      'register.roleDonor': 'Doador — Tenho alimentos para compartilhar',
      'register.roleReceiver': 'Receptor — Preciso receber alimentos',
      'register.roleBoth': 'Ambos — Doo e também recebo',
      'register.hasAccount': 'Já tem conta?', 'register.login': 'Entrar',
      'register.terms': 'Ao criar sua conta, você concorda com os',
      'register.termsLink': 'Termos de Uso', 'register.and': 'e',
      'register.privacyLink': 'Política de Privacidade',

      /* ── Receber ── */
      'receive.tag': 'Alimentos disponíveis', 'receive.title': 'Receber Alimentos',
      'receive.desc': 'Encontre alimentos disponíveis para doação na sua região.',
      'receive.filter.all': 'Todas as categorias', 'receive.filter.location': 'Localização',
      'receive.filter.sort': 'Ordenar por', 'receive.filter.newest': 'Mais recentes',
      'receive.filter.expiring': 'Expirando logo', 'receive.filter.qty': 'Maior quantidade',
      'receive.modal.title': 'Solicitar Alimento', 'receive.modal.qty': 'Quantidade desejada',
      'receive.empty': 'Nenhuma doação disponível no momento.',

      /* ── Doar ── */
      'donate.tag': 'Faça a diferença', 'donate.title': 'Cadastrar Doação',
      'donate.desc': 'Preencha o formulário abaixo para disponibilizar alimentos para a comunidade.',
      'donate.section.food': 'Dados do Alimento', 'donate.section.location': 'Localização',
      'donate.delivery.pickup': 'Apenas retirada no local',
      'donate.delivery.deliver': 'Posso entregar',
      'donate.delivery.agree': 'A combinar',
      'donate.tips.title': 'Dicas para uma boa doação',

      /* ── Perfil ── */
      'profile.title': 'Meu Perfil', 'profile.edit': 'Editar Perfil',
      'profile.activity': 'Sua atividade', 'profile.myDonations': 'Doações cadastradas',
      'profile.myRequests': 'Solicitações feitas', 'profile.member': 'Membro desde',
      'profile.emailNote': 'O e-mail não pode ser alterado.',
      'profile.roleDonor': 'Doador', 'profile.roleReceiver': 'Receptor', 'profile.roleBoth': 'Doador e Receptor',
      'profile.roleHint': 'Você pode ser doador, receptor ou ambos.',
      'profile.tab.profile': 'Perfil', 'profile.tab.security': 'Segurança',

      /* ── Minhas Doações ── */
      'myDonations.title': 'Minhas Doações', 'myDonations.tag': 'Painel do doador',
      'myDonations.desc': 'Gerencie as doações que você cadastrou.',
      'myDonations.empty': 'Você ainda não cadastrou nenhuma doação.',
      'myDonations.postFirst': 'Cadastrar primeira doação',

      /* ── Solicitações ── */
      'myRequests.title': 'Minhas Solicitações', 'myRequests.tag': 'Histórico',
      'myRequests.desc': 'Acompanhe as solicitações que você fez.',
      'myRequests.empty': 'Você ainda não fez nenhuma solicitação.',
      'receivedRequests.title': 'Solicitações Recebidas',

      /* ── Mapa ── */
      'map.title': 'Mapa de Doações', 'map.tag': 'Geolocalização',
      'map.desc': 'Visualize alimentos disponíveis e ONGs parceiras próximas a você.',
      'map.show': 'Mostrar', 'map.all': 'Tudo',
      'map.onlyFood': 'Apenas doações', 'map.onlyOngs': 'Apenas ONGs',
      'map.category': 'Categoria', 'map.allCats': 'Todas',
      'map.status': 'Status', 'map.allStatus': 'Todos',
      'map.visible': 'Itens visíveis no mapa',

      /* ── Sobre ── */
      'about.tag': 'Nossa história', 'about.title': 'Sobre o Salve Comida',
      'about.desc': 'Conheça a missão, o propósito e o impacto desta plataforma comunitária.',

      /* ── Contato ── */
      'contact.tag': 'Fale conosco', 'contact.title': 'Entre em Contato',
      'contact.desc': 'Tem dúvidas, sugestões ou quer fazer uma parceria? Adoraríamos ouvir você.',
      'contact.form.title': 'Envie sua mensagem',
      'contact.form.sub': 'Preencha o formulário e entraremos em contato em breve.',
      'contact.info.title': 'Informações de contato',
      'contact.subject.doubt': 'Dúvida sobre a plataforma',
      'contact.subject.donation': 'Quero fazer uma doação corporativa',
      'contact.subject.partnership': 'Proposta de parceria',
      'contact.subject.feedback': 'Feedback ou sugestão',
      'contact.subject.report': 'Reportar um problema',
      'contact.subject.other': 'Outro assunto',

      /* ── Dashboard ── */
      'dashboard.title': 'Painel de Impacto', 'dashboard.tag': 'Impacto',
      'dashboard.desc': 'Acompanhe o impacto da plataforma em tempo real.',
      'dashboard.totalDonations': 'Total de doações', 'dashboard.available': 'Disponíveis',
      'dashboard.completed': 'Concluídas', 'dashboard.users': 'Usuários',
      'dashboard.recentTitle': 'Doações recentes',
      'dashboard.col.food': 'Alimento', 'dashboard.col.category': 'Categoria',
      'dashboard.col.qty': 'Quantidade', 'dashboard.col.status': 'Status', 'dashboard.col.date': 'Data',

      /* ── ONGs ── */
      'ongs.title': 'ONGs Parceiras', 'ongs.tag': 'Parceiros',
      'ongs.desc': 'Conheça as organizações parceiras.',

      /* ── Erros / Validação ── */
      'err.required': 'Campo obrigatório.', 'err.invalidEmail': 'E-mail inválido.',
      'err.passwordMin': 'A senha deve ter pelo menos 6 caracteres.',
      'err.passwordMatch': 'As senhas não coincidem.',
      'err.selectSubject': 'Selecione um assunto.',
      'err.fillRequired': 'Preencha todos os campos obrigatórios.',

      /* ── Footer ── */
      'footer.desc': 'Uma plataforma comunitária que conecta doadores de alimentos a pessoas que precisam.',
      'footer.nav': 'Navegação', 'footer.contact': 'Contato',
      'footer.terms': 'Termos de Uso', 'footer.privacy': 'Privacidade',
      'footer.copy': '© 2025 Salve Comida',
    },

    en: {
      /* ── Navbar ── */
      'nav.home': 'Home', 'nav.donate': 'Donate', 'nav.receive': 'Receive',
      'nav.map': 'Map', 'nav.explore': 'Explore', 'nav.impact': 'Impact',
      'nav.ongs': 'NGOs', 'nav.about': 'About', 'nav.contact': 'Contact',
      'nav.myAccount': 'My Account', 'nav.myDonations': 'My Donations',
      'nav.requests': 'Requests', 'nav.profile': 'Profile',
      'nav.login': 'Sign In', 'nav.register': 'Create account', 'nav.logout': 'Sign Out',
      'nav.langToggle': 'PT',

      /* ── Botões comuns ── */
      'btn.save': 'Save changes', 'btn.cancel': 'Cancel', 'btn.send': 'Send',
      'btn.clear': 'Clear', 'btn.back': 'Back', 'btn.confirm': 'Confirm',
      'btn.login': 'Sign In', 'btn.register': 'Create my account',
      'btn.postDonation': 'Post Donation', 'btn.request': 'Request',
      'btn.accept': 'Accept', 'btn.reject': 'Reject', 'btn.complete': 'Complete',
      'btn.cancelRequest': 'Cancel request', 'btn.viewDonation': 'View donation',
      'btn.sendRequest': 'Send Request', 'btn.viewAll': 'View all food →',
      'btn.wantDonate': 'I Want to Donate Now', 'btn.viewAvailable': 'View Available',
      'btn.locateMe': 'Use my location',

      /* ── Status ── */
      'status.available': 'Available', 'status.reserved': 'Reserved',
      'status.completed': 'Completed', 'status.cancelled': 'Cancelled',
      'status.pending': 'Pending', 'status.accepted': 'Accepted', 'status.rejected': 'Rejected',

      /* ── Categorias ── */
      'cat.fruits': 'Fruits & vegetables', 'cat.breads': 'Breads & pasta',
      'cat.meals': 'Ready meals', 'cat.canned': 'Canned goods',
      'cat.dairy': 'Dairy products', 'cat.drinks': 'Beverages', 'cat.other': 'Other',

      /* ── Labels de formulário ── */
      'label.name': 'Name', 'label.email': 'Email', 'label.password': 'Password',
      'label.confirmPassword': 'Confirm password', 'label.phone': 'Phone / WhatsApp',
      'label.city': 'City', 'label.state': 'State', 'label.address': 'Address',
      'label.category': 'Category', 'label.quantity': 'Quantity',
      'label.unit': 'Type / packaging', 'label.description': 'Description',
      'label.expiryDate': 'Pickup deadline', 'label.delivery': 'Delivery option',
      'label.street': 'Street / Avenue', 'label.number': 'Number',
      'label.complement': 'Complement', 'label.notes': 'Additional notes',
      'label.photo': 'Food photo', 'label.optional': '(optional)',
      'label.profile': 'Profile', 'label.role': 'Account type',
      'label.maxPerRequest': 'Limit per request',
      'label.subject': 'Subject', 'label.message': 'Message',
      'label.pickupLocation': 'Pickup location',
      'label.requestQty': 'Requested quantity',
      'label.requestDate': 'Request date',
      'label.donationStatus': 'Donation status',
      'label.receiverCity': 'City',
      'label.receiverAddress': "Receiver's address",
      'label.requestedBy': 'Requested by:',
      'label.donor': 'Donor:',
      'label.shareAddress': 'Share my address with the donor after the request is accepted',
      'label.shareAddressHint': 'If enabled, your profile address will be visible to the donor only after acceptance. Phone and email are never shared.',

      /* ── Placeholders ── */
      'ph.name': 'Full name', 'ph.email': 'your@email.com',
      'ph.password': 'Minimum 6 characters', 'ph.confirmPassword': 'Repeat password',
      'ph.phone': '+1 555 000-0000', 'ph.city': 'Type to search...',
      'ph.street': 'e.g. Oak Street', 'ph.number': 'e.g. 45',
      'ph.foodName': 'e.g. Mixed breads', 'ph.qty': 'e.g. 10',
      'ph.unit': 'e.g. 1kg bags, cans, kg', 'ph.maxQty': 'e.g. 2',
      'ph.description': 'Describe the food, condition, origin, etc.',
      'ph.notes': 'Pickup hours, extra information, etc.',
      'ph.message': 'Write your message here...',
      'ph.requestMessage': 'Message to the donor (optional)',
      'ph.search': 'Search food...', 'ph.location': 'Filter by city...',

      /* ── Páginas ── */
      'home.tag': 'Food Donation Platform',
      'home.hero.title': 'Share more,\nwaste less.',
      'home.hero.desc': 'We connect food donors to people in need. Bakeries, restaurants, markets and citizens — building a more caring community together.',
      'home.howWorks.tag': 'How it works',
      'home.howWorks.title': 'Simple, fast and caring',
      'home.howWorks.desc': 'In a few steps, you connect food that would be wasted to people who need it.',
      'home.step1.title': 'Post a donation', 'home.step1.desc': 'Donors fill out a form with the details of available food.',
      'home.step2.title': 'Community views', 'home.step2.desc': 'Anyone can see available food, filter by category and location.',
      'home.step3.title': 'Request food', 'home.step3.desc': 'The user makes a request providing their details and desired quantity.',
      'home.step4.title': 'Arrange pickup', 'home.step4.desc': 'Donor and receiver arrange pickup or delivery directly.',
      'home.benefits.tag': 'Why participate', 'home.benefits.title': 'Benefits for everyone',
      'home.cta.title': 'Have surplus food?',
      'home.cta.desc': 'Avoid waste. Post your donation now and help someone nearby.',
      'home.recent.tag': 'Available now', 'home.recent.title': 'Food waiting for you',

      /* ── Login / Cadastro ── */
      'login.title': 'Sign in to your account', 'login.sub': 'Welcome back!',
      'login.forgot': 'Forgot my password', 'login.noAccount': "Don't have an account?",
      'login.createAccount': 'Create free account',
      'register.title': 'Create account', 'register.sub': 'Join the Salve Comida community',
      'register.roleLabel': 'What is your profile?',
      'register.roleDonor': 'Donor — I have food to share',
      'register.roleReceiver': 'Receiver — I need to receive food',
      'register.roleBoth': 'Both — I donate and also receive',
      'register.hasAccount': 'Already have an account?', 'register.login': 'Sign In',
      'register.terms': 'By creating your account, you agree to the',
      'register.termsLink': 'Terms of Use', 'register.and': 'and',
      'register.privacyLink': 'Privacy Policy',

      /* ── Receber ── */
      'receive.tag': 'Available food', 'receive.title': 'Receive Food',
      'receive.desc': 'Find food available for donation in your region.',
      'receive.filter.all': 'All categories', 'receive.filter.location': 'Location',
      'receive.filter.sort': 'Sort by', 'receive.filter.newest': 'Newest',
      'receive.filter.expiring': 'Expiring soon', 'receive.filter.qty': 'Most quantity',
      'receive.modal.title': 'Request Food', 'receive.modal.qty': 'Desired quantity',
      'receive.empty': 'No donations available at the moment.',

      /* ── Doar ── */
      'donate.tag': 'Make a difference', 'donate.title': 'Post a Donation',
      'donate.desc': 'Fill out the form below to make food available to the community.',
      'donate.section.food': 'Food Details', 'donate.section.location': 'Location',
      'donate.delivery.pickup': 'Pickup only',
      'donate.delivery.deliver': 'I can deliver',
      'donate.delivery.agree': 'To be arranged',
      'donate.tips.title': 'Tips for a good donation',

      /* ── Perfil ── */
      'profile.title': 'My Profile', 'profile.edit': 'Edit Profile',
      'profile.activity': 'Your activity', 'profile.myDonations': 'Donations posted',
      'profile.myRequests': 'Requests made', 'profile.member': 'Member since',
      'profile.emailNote': 'Email cannot be changed.',
      'profile.roleDonor': 'Donor', 'profile.roleReceiver': 'Receiver', 'profile.roleBoth': 'Donor & Receiver',
      'profile.roleHint': 'You can be a donor, receiver or both.',
      'profile.tab.profile': 'Profile', 'profile.tab.security': 'Security',

      /* ── Minhas Doações ── */
      'myDonations.title': 'My Donations', 'myDonations.tag': 'Donor dashboard',
      'myDonations.desc': 'Manage the donations you have posted.',
      'myDonations.empty': 'You have not posted any donations yet.',
      'myDonations.postFirst': 'Post first donation',

      /* ── Solicitações ── */
      'myRequests.title': 'My Requests', 'myRequests.tag': 'History',
      'myRequests.desc': 'Track the requests you have made.',
      'myRequests.empty': 'You have not made any requests yet.',
      'receivedRequests.title': 'Received Requests',

      /* ── Mapa ── */
      'map.title': 'Donation Map', 'map.tag': 'Geolocation',
      'map.desc': 'View available food and partner NGOs near you.',
      'map.show': 'Show', 'map.all': 'Everything',
      'map.onlyFood': 'Donations only', 'map.onlyOngs': 'NGOs only',
      'map.category': 'Category', 'map.allCats': 'All',
      'map.status': 'Status', 'map.allStatus': 'All',
      'map.visible': 'Items visible on map',

      /* ── Sobre ── */
      'about.tag': 'Our story', 'about.title': 'About Salve Comida',
      'about.desc': 'Learn about the mission, purpose and impact of this community platform.',

      /* ── Contato ── */
      'contact.tag': 'Get in touch', 'contact.title': 'Contact Us',
      'contact.desc': 'Have questions, suggestions or want to partner? We would love to hear from you.',
      'contact.form.title': 'Send your message',
      'contact.form.sub': 'Fill out the form and we will get back to you shortly.',
      'contact.info.title': 'Contact information',
      'contact.subject.doubt': 'Question about the platform',
      'contact.subject.donation': 'I want to make a corporate donation',
      'contact.subject.partnership': 'Partnership proposal',
      'contact.subject.feedback': 'Feedback or suggestion',
      'contact.subject.report': 'Report a problem',
      'contact.subject.other': 'Other subject',

      /* ── Dashboard ── */
      'dashboard.title': 'Impact Dashboard', 'dashboard.tag': 'Impact',
      'dashboard.desc': 'Track the platform impact in real time.',
      'dashboard.totalDonations': 'Total donations', 'dashboard.available': 'Available',
      'dashboard.completed': 'Completed', 'dashboard.users': 'Users',
      'dashboard.recentTitle': 'Recent donations',
      'dashboard.col.food': 'Food', 'dashboard.col.category': 'Category',
      'dashboard.col.qty': 'Quantity', 'dashboard.col.status': 'Status', 'dashboard.col.date': 'Date',

      /* ── ONGs ── */
      'ongs.title': 'Partner NGOs', 'ongs.tag': 'Partners',
      'ongs.desc': 'Meet our partner organizations.',

      /* ── Erros / Validação ── */
      'err.required': 'Required field.', 'err.invalidEmail': 'Invalid email.',
      'err.passwordMin': 'Password must be at least 6 characters.',
      'err.passwordMatch': 'Passwords do not match.',
      'err.selectSubject': 'Please select a subject.',
      'err.fillRequired': 'Please fill in all required fields.',

      /* ── Footer ── */
      'footer.desc': 'A community platform connecting food donors to people in need.',
      'footer.nav': 'Navigation', 'footer.contact': 'Contact',
      'footer.terms': 'Terms of Use', 'footer.privacy': 'Privacy Policy',
      'footer.copy': '© 2025 Salve Comida',
    }
  };

  function t(key) {
    return (_t[_lang] && _t[_lang][key]) || (_t['pt'] && _t['pt'][key]) || key;
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    // Atualiza botão de toggle
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = t('nav.langToggle');
  }

  function setLang(lang) {
    _lang = lang;
    localStorage.setItem('sc_lang', lang);
    apply();
  }

  function getLang() { return _lang; }

  function toggle() { setLang(_lang === 'pt' ? 'en' : 'pt'); }

  return { t: t, apply: apply, setLang: setLang, getLang: getLang, toggle: toggle };
})();

document.addEventListener('DOMContentLoaded', function() { I18n.apply(); });
