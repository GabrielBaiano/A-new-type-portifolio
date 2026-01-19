// Home Page Component
// Actualy this page is the about page --!


const HomePage = {
    render() {
        return `
            <!-- Card 1: Perfil Principal -->
            <div class="card profile-card">
                <!-- Header -->
                <div class="header">
                    <div class="user-info">
                        <div class="avatar-container">
                            <div class="avatar-flipper">
                                <div class="avatar-front"></div>
                                <div class="avatar-back"></div>
                            </div>
                        </div>
                        <div class="user-details">
                            <h1>Gabriel Nascimento Gama</h1>
                            <p>Full Stack Dev</p>
                        </div>
                    </div>
                    <!-- Colorized 3-symbol logo -->
                    <div class="brand-logo-container">
                        <div class="brand-logo-top">
                            <svg viewBox="0 0 100 86.6" class="symbol-yellow">
                                <polygon points="50,0 100,86.6 0,86.6"/>
                            </svg>
                        </div>
                        <div class="brand-logo-bottom">
                            <span class="symbol-pink"></span>
                            <span class="symbol-green"></span>
                        </div>
                    </div>
                </div>

                <!-- Bio -->
                <div class="bio">
                    <p>
Welcome, i'm a Brazilian Full-Stack Developer with over 3 years of experience, and I'm also part of the <strong>YellowHood agency</strong>.
                    </p>
                    <br>
                    <p>
                        Professionally, my main stack is the <strong>JavaScript ecosystem (JS, TS, Node.js)</strong>,
                        powered by <strong>AWS</strong> and <strong>SQL</strong> databases.
                    </p>
                    <br>
                    <p>
                        In my personal projects, I love exploring low-level concepts and
                        automation using <strong>Python</strong> and <strong>C++</strong>.
                    </p>
                </div>

                <!-- Links Sociais -->
                <div class="social-links">
                    <a href="https://www.linkedin.com/in/gabriel-nascimento-gama-5b0b30185/" class="social-btn"><i
                            class="fa-brands fa-linkedin"></i> Linkedin</a>
                    <a href="https://github.com/GabrielBaiano" class="social-btn"><i class="fa-brands fa-github"></i>
                        GitHub</a>
                    <a href="http://lattes.cnpq.br/1588167693631178" target="_blank" class="social-btn"><i class="fa-solid fa-graduation-cap"></i> Lattes CV</a>
                    <a href="mailto:gabrielngama@gmail.com" class="social-btn contact-email"><i class="fa-solid fa-envelope"></i> Mail</a>
                </div>

                <!-- Linha Divisória -->
                <div class="divider"></div>

                <!-- Lista de Experiência -->
                <div class="experience-list">

                    <!-- Item 0: Yellowhood -->
                    <div class="job-item highlighted-job">
                        <div class="job-left">
                            <div class="company-logo logo-yellowhood"></div>
                            <div class="job-details">
                                <h3>Yellowhood</h3>
                                <span>Founder & Lead Developer</span>
                            </div>
                        </div>
                        <div class="job-date">2025 - present</div>
                    </div>

                    <!-- Item 1 -->
                    <div class="job-item">
                        <div class="job-left">
                            <div class="company-logo bg-darkblue"></div>
                            <div class="job-details">
                                <h3>Compass UOL</h3>
                                <span>Mobile Developer</span>
                            </div>
                        </div>
                        <div class="job-date">2024 – 2025</div>
                    </div>

                    <!-- Item 2 -->
                    <div class="job-item">
                        <div class="job-left">
                            <div class="company-logo bg-lime"></div>
                            <div class="job-details">
                                <h3>Techsolutions</h3>
                                <span>Full Stack</span>
                            </div>
                        </div>
                        <div class="job-date">2023 – 2024</div>
                    </div>

                    <!-- Item 3 -->
                    <div class="job-item">
                        <div class="job-left">
                            <div class="company-logo bg-orange"></div>
                            <div class="job-details">
                                <h3>Emporio 24h</h3>
                                <span>Web Developer</span>
                            </div>
                        </div>
                        <div class="job-date">2022 – 2023</div>
                    </div>

                    <!-- Item 4 -->
                    <div class="job-item">
                        <div class="job-left">
                            <div class="company-logo bg-green"></div>
                            <div class="job-details">
                                <h3>Shultz</h3>
                                <span>Full Stack Developer</span>
                            </div>
                        </div>
                        <div class="job-date">2022</div>
                    </div>

                </div>
            </div>

            <!-- Card 2: Education -->
            <div class="card education-card">
                <h2 class="section-title">Education</h2>

                <div class="experience-list">

                    <!-- Edu 1 -->
                    <div class="job-item">
                        <div class="job-left">
                            <div class="company-logo bg-bright-blue"></div>
                            <div class="job-details">
                                <h3>UNESP</h3>
                                <span>Master's degree in computer science</span>
                            </div>
                        </div>
                        <div class="job-date">present</div>
                    </div>

                    <!-- Edu 2 -->
                    <div class="job-item">
                        <div class="job-left">
                            <div class="company-logo bg-red"></div>
                            <div class="job-details">
                                <h3>FACINT</h3>
                                <span>Systems Analysis and Development</span>
                            </div>
                        </div>
                        <div class="job-date">2023 - 2025</div>
                    </div>

                </div>
            </div>

            <!-- Card 3: Location Map -->
            <div class="card location-card">
                <h2 class="section-title">Where am I?</h2>
                <div id="location-map-container" class="map-wrapper">
                    <div id="home-map"></div>
                    <div class="map-overlay">
                        <div class="location-details">
                            <p id="distance-text">Calculating distance to you...</p>
                            <span class="footnote">According to your IP address • Itanhaém, SP</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    onMount() {
        // Reinicializa a funcionalidade do avatar flip
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

        // Feature: Copy Email to clipboard
        const emailBtn = document.querySelector('.contact-email');
        if (emailBtn) {
            emailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const email = "gabrielngama@gmail.com";
                navigator.clipboard.writeText(email).then(() => {
                    const originalText = emailBtn.innerHTML;
                    emailBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    emailBtn.style.backgroundColor = '#00a650';
                    
                    setTimeout(() => {
                        emailBtn.innerHTML = originalText;
                        emailBtn.style.backgroundColor = '';
                    }, 2000);
                });
            });
        }

        // Initialize Location Map
        this.initLocationMap();
    },

    async initLocationMap() {
        const mapContainer = document.getElementById('home-map');
        if (!mapContainer) return;

        // Coordinates for Itanhaém, SP, Brazil
        const myLocation = { lat: -24.183, lon: -46.791 };

        // 1. Initialize Leaflet Map
        const map = L.map('home-map', {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: false
        }).setView([myLocation.lat, myLocation.lon], 4);

        // 2. Add Dark Theme Tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        // 3. Add Pulse Marker for Me
        const myIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: '<div class="pulse"></div><div class="dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        L.marker([myLocation.lat, myLocation.lon], { icon: myIcon }).addTo(map);

        try {
            // 4. Get Visitor Location (IP-based)
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.latitude && data.longitude) {
                const visitorLoc = { lat: data.latitude, lon: data.longitude };

                // 5. Calculate Distance (Haversine Formula)
                const distance = this.calculateDistance(
                    myLocation.lat, myLocation.lon,
                    visitorLoc.lat, visitorLoc.lon
                );

                // 6. Update UI
                const distText = document.getElementById('distance-text');
                if (distText) {
                    const visitorPlace = data.city ? `${data.city}, ${data.country_name}` : data.country_name;
                    distText.innerHTML = `I'm from <strong>Itanhaém, Brazil</strong>, roughly <span class="highlight-dist">${distance.toLocaleString('pt-BR')}km</span> away from <strong>${visitorPlace}</strong>.`;
                }

                // 7. Draw Connection Line (Dashed Arc)
                const visitorMarker = L.circleMarker([visitorLoc.lat, visitorLoc.lon], {
                    radius: 5,
                    color: '#fff',
                    fillOpacity: 1
                }).addTo(map);

                const lineCoords = [
                    [myLocation.lat, myLocation.lon],
                    [visitorLoc.lat, visitorLoc.lon]
                ];
                
                const polyline = L.polyline(lineCoords, {
                    color: '#ff2d55',
                    weight: 2,
                    dashArray: '5, 10',
                    className: 'map-connection-line'
                }).addTo(map);

                // 8. Adjust view to fit both
                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
            }
        } catch (error) {
            console.error('Error fetching visitor location:', error);
            const distText = document.getElementById('distance-text');
            if (distText) distText.innerText = "Somewhere on Earth, and I'm here in Itanhaém, Brazil.";
        }
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
