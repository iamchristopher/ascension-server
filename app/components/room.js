import {
    JSDOM
} from 'jsdom';

let rooms = {};

export async function add ({
    id,
    socket
} = {}) {
    const room = get({ id });

    if (room !== undefined) {
        return room;
    }

    let env = await JSDOM.fromFile('index.html', {
        url: 'http://localhost:8080',
        runScripts: 'dangerously',
        resources: 'usable',
        pretendToBeVisual: true
    });

    env.window.room = id;
    env.window.io = socket;

    return rooms[id] = {
        id,
        env,
        clients: {},
        join: ({ user, ...data }) => join({
            id,
            user,
            ...data
        }),
        leave: ({ user }) => leave({
            id,
            user
        })
    };
}

export function get ({
    id = null
} = {}) {
    if (!id) {
        return rooms;
    }

    return rooms[id];
}

export function join ({
    id,
    user
} = {}) {
    const room = get({ id });
    const {
        id: userId,
        ...userData
    } = user;

    room.clients[userId] = userData;

    return room;
}

export function leave ({
    id,
    user
} = {}) {
    const room = get({ id });
    const {
        [user.toString()]: deletedUser,
        ...clients
    } = room.clients;

    room.clients = clients;

    return room;
}
