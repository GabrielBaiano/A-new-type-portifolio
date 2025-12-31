// PageManager.js - Gerenciador de páginas e transições
class PageManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pages = {};
        this.currentPage = null;
        this.isTransitioning = false;
        this.pendingPage = null;
        
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
        }
    }

    /**
     * Registra uma nova página
     * @param {string} name - Nome da página
     * @param {Object} pageModule - Módulo da página com métodos render, onMount, onUnmount
     */
    registerPage(name, pageModule) {
        this.pages[name] = pageModule;
    }

    /**
     * Carrega e exibe uma página
     * @param {string} pageName - Nome da página a ser carregada
     * @param {Object} params - Parâmetros da rota (opcional)
     */
    async loadPage(pageName, params = {}) {
        // Se já estamos nessa página, não faz nada
        if (this.currentPage === pageName && !this.isTransitioning) {
            return;
        }

        // Se está em transição, guarda a página pendente
        if (this.isTransitioning) {
            this.pendingPage = { name: pageName, params };
            return;
        }

        const page = this.pages[pageName];
        
        if (!page) {
            console.error(`Page "${pageName}" not registered`);
            return;
        }

        // Previne múltiplas transições simultâneas
        this.isTransitioning = true;

        // Transição de saída
        await this.fadeOut();

        // Chama onUnmount da página anterior APÓS o fadeOut para evitar
        // que elementos sumam ou mudem de tamanho enquanto ainda estão visíveis
        if (this.currentPage && this.pages[this.currentPage]?.onUnmount) {
            this.pages[this.currentPage].onUnmount();
        }

        // Renderiza nova página (passa parâmetros)
        const content = page.render(params);
        this.container.innerHTML = content;

        // Chama onMount da nova página ANTES do fadeIn para evitar pulos de layout
        // (ex: adicionar classes no body que mudam o tamanho do container)
        if (page.onMount) {
            page.onMount(params);
        }

        // Transição de entrada
        await this.fadeIn();

        this.currentPage = pageName;
        this.isTransitioning = false;
        
        // Se há uma página pendente, carrega ela
        if (this.pendingPage && this.pendingPage.name !== pageName) {
            const nextPage = this.pendingPage;
            this.pendingPage = null;
            this.loadPage(nextPage.name, nextPage.params);
        } else {
            this.pendingPage = null;
        }
    }

    /**
     * Animação de fade out
     */
    fadeOut() {
        return new Promise(resolve => {
            this.container.style.opacity = '0';
            this.container.style.transform = 'translateY(10px)';
            setTimeout(resolve, 300);
        });
    }

    /**
     * Animação de fade in
     */
    fadeIn() {
        return new Promise(resolve => {
            // Force reflow
            this.container.offsetHeight;
            
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
            setTimeout(resolve, 300);
        });
    }

    /**
     * Obtém a página atual
     */
    getCurrentPage() {
        return this.currentPage;
    }
}

// Exporta instância única do page manager
const pageManager = new PageManager('app');
