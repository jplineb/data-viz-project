document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('videoModal');
    const btn = document.getElementById('videoButton');
    const closeBtn = document.querySelector('.close-button');

    btn.onclick = function() {
        modal.classList.add('show');
    }

    closeBtn.onclick = function() {
        modal.classList.remove('show');
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    }
});