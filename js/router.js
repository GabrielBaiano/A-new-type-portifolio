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
     * @param {string} path - Caminho da rota (ex: 'home', 'projects', 'detail/:type/:id')
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
     * Extrai parâmetros de uma rota
     * @param {string} pattern - Padrão da rota (ex: 'detail/:type/:id')
     * @param {string} path - Caminho atual (ex: 'detail/project/my-project')
     * @returns {Object|null} - Objeto com parâmetros ou null se não corresponder
     */
    extractParams(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        // Se o número de partes não corresponder, não é uma correspondência
        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            // Se a parte do padrão começa com :, é um parâmetro
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // Se não é um parâmetro e não corresponde, não é uma correspondência
                return null;
            }
        }

        return params;
    }

    /**
     * Encontra a rota correspondente e extrai parâmetros
     * @param {string} path - Caminho atual
     * @returns {Object|null} - Objeto com handler e params ou null
     */
    matchRoute(path) {
        // Primeiro, tenta correspondência exata
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        // Depois, tenta correspondência com parâmetros
        for (const pattern in this.routes) {
            const params = this.extractParams(pattern, path);
            if (params !== null) {
                return { handler: this.routes[pattern], params };
            }
        }

        return null;
    }

    /**
     * Manipula mudanças de rota
     */
    handleRouteChange() {
        const path = this.getCurrentPath();
        const match = this.matchRoute(path);

        if (match) {
            this.currentRoute = path;
            match.handler(match.params);
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
