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
        // Permite carregar a mesma página (útil para re-renderizar após mudanças de estado interno)
        // Apenas bloqueia se já estiver em transição
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

        try {
            // Transição de saída
            await this.fadeOut();

            // Chama onUnmount da página anterior
            if (this.currentPage && this.pages[this.currentPage]?.onUnmount) {
                try {
                    this.pages[this.currentPage].onUnmount();
                } catch (e) {
                    console.error(`[PageManager] Error in onUnmount of ${this.currentPage}:`, e);
                }
            }

            // Renderiza nova página
            const content = await page.render(params);
            this.container.innerHTML = content;

            // Chama onMount da nova página
            if (page.onMount) {
                try {
                    page.onMount(params);
                } catch (e) {
                    console.error(`[PageManager] Error in onMount of ${pageName}:`, e);
                }
            }

            // Transição de entrada
            await this.fadeIn();

            this.currentPage = pageName;
            this.currentParams = params;
            
            // Ensure Ornamental Border is active (User wants it to persist)
            if (window.drawingSystem) {
                if (pageName === 'home') {
                    window.drawingSystem.setOrnamentalBorder(true);
                }
            }
            
        } catch (error) {
            console.error(`[PageManager] Error loading page ${pageName}:`, error);
            // Emergency restore: show container if it failed during fade
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
        } finally {
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
