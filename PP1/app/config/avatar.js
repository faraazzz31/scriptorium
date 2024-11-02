// app/config/avatars.js
export const avatarConfig = {
    basePath: '/avatars',
    defaultAvatars: [
        {
            path: '/avatars/avatar1.jpg',
            label: 'Default Avatar 1',
            alt: 'A man avatar'
        },
        {
            path: '/avatars/avatar2.png',
            label: 'Default Avatar 2',
            alt: 'A woman avatar'
        },
    ],
    // Get just the paths for validation
    getValidPaths() {
        return this.defaultAvatars.map(avatar => avatar.path);
    },
    // Get default avatar path
    getDefaultPath() {
        return this.defaultAvatars[0].path;
    }
};