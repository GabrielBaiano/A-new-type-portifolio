// PageManager.js - Gerenciador de páginas e transições
class PageManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pages = {};
        this.currentPage = null;
        this.isTransitioning = false;
        
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
     */
    async loadPage(pageName) {
        if (this.isTransitioning) {
            return;
        }

        const page = this.pages[pageName];
        
        if (!page) {
            console.error(`Page "${pageName}" not registered`);
            return;
        }

        // Previne múltiplas transições simultâneas
        this.isTransitioning = true;

        // Chama onUnmount da página anterior
        if (this.currentPage && this.pages[this.currentPage]?.onUnmount) {
            this.pages[this.currentPage].onUnmount();
        }

        // Transição de saída
        await this.fadeOut();

        // Renderiza nova página
        const content = page.render();
        this.container.innerHTML = content;

        // Transição de entrada
        await this.fadeIn();

        // Chama onMount da nova página
        if (page.onMount) {
            page.onMount();
        }

        this.currentPage = pageName;
        this.isTransitioning = false;
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
