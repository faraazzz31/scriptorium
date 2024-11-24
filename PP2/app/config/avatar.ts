// Used Github co-pilot to help me write this code

interface Avatar {
    path: string;
    label: string;
    alt: string;
}

interface AvatarConfig {
    basePath: string;
    defaultAvatars: Avatar[];
    getValidPaths: () => string[];
    getDefaultPath: () => string;
}

export const avatarConfig: AvatarConfig = {
    basePath: '/avatars',
    defaultAvatars: [
        {
            path: 'avatars/avatar1.jpg',
            label: 'Default Avatar 1',
            alt: 'A man avatar'
        },
        {
            path: 'avatars/avatar2.png',
            label: 'Default Avatar 2',
            alt: 'A woman avatar'
        },
        {
            path: 'avatars/avatar3.avif',
            label: 'Default Avatar 3',
            alt: 'A penguin avatar'
        },
        {
            path: 'avatars/avatar4.webp',
            label: 'Default Avatar 4',
            alt: 'A dog avatar'
        },
        {
            path: 'avatars/avatar5.webp',
            label: 'Default Avatar 5',
            alt: 'A cat avatar'
        }
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