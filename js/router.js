// Router.js - Sistema de roteamento SPA
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.defaultRoute = 'home';
        
        // Listen para mudanças de hash
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    /**
     * Registra uma nova rota
     * @param {string} path - Caminho da rota (ex: 'home', 'projects')
     * @param {Function} handler - Função que retorna o conteúdo da página
     */
    register(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Navega para uma rota específica
     * @param {string} path - Caminho da rota
     */
    navigate(path) {
        window.location.hash = `#/${path}`;
    }

    /**
     * Obtém a rota atual do hash
     * @returns {string} - Nome da rota atual
     */
    getCurrentPath() {
        const hash = window.location.hash.slice(1); // Remove o #
        const path = hash.startsWith('/') ? hash.slice(1) : hash;
        return path || this.defaultRoute;
    }

    /**
     * Manipula mudanças de rota
     */
    handleRouteChange() {
        const path = this.getCurrentPath();
        const handler = this.routes[path];

        if (handler) {
            this.currentRoute = path;
            handler(path);
        } else {
            // Rota não encontrada, redireciona para home
            console.warn(`Route not found: ${path}, redirecting to ${this.defaultRoute}`);
            this.navigate(this.defaultRoute);
        }
    }

    /**
     * Define a rota padrão
     * @param {string} route - Nome da rota padrão
     */
    setDefaultRoute(route) {
        this.defaultRoute = route;
    }
}

// Exporta instância única do router
const router = new Router();
