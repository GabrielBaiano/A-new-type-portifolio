// Script.js
document.addEventListener('DOMContentLoaded', () => {
    const avatarContainer = document.querySelector('.avatar-container');
    const avatarFlipper = document.querySelector('.avatar-flipper');

    if (avatarContainer && avatarFlipper) {
        // Animação automática ao carregar a página
        setTimeout(() => {
            avatarFlipper.classList.add('flip');
            
            // Volta depois de 2 segundos
            setTimeout(() => {
                avatarFlipper.classList.remove('flip');
            }, 2000);
        }, 1000);

        // Click manual para flipar
        avatarContainer.addEventListener('click', () => {
            avatarFlipper.classList.toggle('flip');
        });
    }

    // ===== SPA NAVIGATION =====
    const navItems = document.querySelectorAll('.nav-item:not(.icon-only)');
    const pages = document.querySelectorAll('.page');
    
    // Função para navegar entre páginas
    function navigateTo(pageId) {
        // Remove active de todas as páginas
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Adiciona active na página selecionada
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    // Event listeners para navegação
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const pageId = item.getAttribute('data-page');
            
            // Remove a classe active de todos os itens
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Adiciona a classe active ao item clicado
            item.classList.add('active');
            
            // Navega para a página
            if (pageId) {
                navigateTo(pageId);
            }
        });
    });
});
