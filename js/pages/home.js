// Home Page Component
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
                            <h1>Gabriel Gama</h1>
                            <p>Full Stack Dev</p>
                        </div>
                    </div>
                    <!-- Ícone similar ao da imagem original -->
                    <div class="brand-logo">
                        <i class="fa-solid fa-shapes"></i>
                    </div>
                </div>

                <!-- Bio -->
                <div class="bio">
                    <p>
Welcome to <i>my space on the internet</i>. I'm a Full-Stack Developer with over 3 years of experience, and I'm also part of the <strong>YellowHood agency</strong>.
                    </p>
                    <br>
                    <p>
                        Growing up, I spent hours immersed in video games, and between levels, I developed high expectations
                        for how technology should feel. Today, I bring that precision to my code.
                    </p>
                    <br>
                    <p>
                        Professionally, my main stack is the <strong>JavaScript ecosystem (JS, TS, Node.js)</strong>,
                        powered by <strong>AWS</strong> and <strong>SQL</strong> databases.
                    </p>
                    <br>
                    <p>
                        In my personal projects, I love exploring low-level concepts and
                        automation using <strong>Python</strong> and <strong>C++</strong>. Have fun exploring my portfolio!
                    </p>
                </div>

                <!-- Links Sociais -->
                <div class="social-links">
                    <a href="https://x.com/uMagicalJake" class="social-btn"><i class="fa-brands fa-twitter"></i> Twitter</a>
                    <a href="https://www.linkedin.com/in/gabriel-nascimento-gama-5b0b30185/" class="social-btn"><i
                            class="fa-brands fa-linkedin"></i> Linkedin</a>
                    <a href="https://github.com/GabrielBaiano" class="social-btn"><i class="fa-brands fa-github"></i>
                        GitHub</a>
                    <a href="mailto:gabrielngama@gmail.com" class="social-btn"><i class="fa-solid fa-envelope"></i> Mail</a>
                </div>

                <!-- Linha Divisória -->
                <div class="divider"></div>

                <!-- Lista de Experiência -->
                <div class="experience-list">

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
                                <span>Full Stack Assistant</span>
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
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
