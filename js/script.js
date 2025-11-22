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
});
