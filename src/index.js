import Mixin from './mixin';
import Logger from './logger';
import Listener from './listener';
import Emitter from './emitter';
import SocketIO from 'socket.io-client';

export default class VueSocketIO {

    /**
     * lets take all resource
     * @param io
     * @param vuex
     * @param debug
     * @param options
     */
    constructor({connection, vuex, debug, options}){

        Logger.debug = debug;
        this.io = this.connect(connection, options);
        this.emitter = new Emitter(vuex);
        this.listener = new Listener(this.io, this.emitter);

    }

    /**
     * Vue.js entry point
     * @param Vue
     */
    install(Vue){

        const version = Number(Vue.version.split('.')[0])

        if (version >= 3) {
            Vue.config.globalProperties.$socket = this.io;
            Vue.config.globalProperties.$vueSocketIo = this;
        } else {
            Vue.prototype.$socket = this.io;
            Vue.prototype.$vueSocketIo = this;
        }

        Vue.mixin(Mixin);

        Logger.info('Vue-Socket.io plugin enabled');

    }


    /**
     * registering SocketIO instance
     * @param connection
     * @param options
     */
    connect(connection, options){
        let socket; // Declare socket here to reference it in multiple places

        if(connection && typeof connection === 'object'){
            Logger.info('Received socket.io-client instance');
            socket = connection;

        } else if(typeof connection === 'string'){
            Logger.info('Received connection string');
            socket = SocketIO(connection, options);

        } else {
            throw new Error('Unsupported connection type');
        }

        // Register the connect_error listener on the socket instance
        socket.on("connect_error", () => {
            // revert to classic upgrade
            socket.io.opts.transports = ["polling", "websocket"];
        });

        return socket; // Return the socket (either passed or newly created)
    }

}
