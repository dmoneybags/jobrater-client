export const showError = (text) => {
    const notification = document.createElement('div');
    notification.className = 'notification is-danger sticky-notification';
    notification.textContent = text;
    
    document.body.prepend(notification);

    // Trigger the animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    setTimeout(() => {
        // Slide the notification back up and remove it
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Match the transition time
    }, 3000);
}
export const showSuccess = (text) => {
    const notification = document.createElement('div');
    notification.className = 'notification is-success sticky-notification';
    notification.textContent = text;
    
    document.body.prepend(notification);

    // Trigger the animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    setTimeout(() => {
        // Slide the notification back up and remove it
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Match the transition time
    }, 3000);
}