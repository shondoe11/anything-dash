/**
 * Performance optimization utils fr heavy React components
 */

//& throttle function limit expensive operations
export const throttle = (func, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

//& debounce function prevent rapid-fire events
export const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

//& lightweight memory cache fr expensive calculations
export const createCache = (maxSize = 100) => {
  const cache = new Map();
  
  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      if (cache.size >= maxSize) {
        //~ remove oldest entry when cache full
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
      return value;
    },
    has: (key) => cache.has(key),
    clear: () => cache.clear()
  };
};

//& prevent layout thrashing by batching DOM reads/writes
export const batchDomOperations = (readFn, writeFn) => {
  //~ first read all values (forces layout calculation once)
  const values = readFn();
  
  //~ then perform all writes (minimizes reflow)
  window.requestAnimationFrame(() => {
    writeFn(values);
  });
};

//& delayed loading renderer only renders aft set timeout
export const createDelayedRenderer = (timeout = 0) => {
  let queue = [];
  let isProcessing = false;
  
  const processQueue = () => {
    if (queue.length === 0) {
      isProcessing = false;
      return;
    }
    
    isProcessing = true;
    const batch = queue.splice(0, 5); //~ process in small batches
    
    batch.forEach(item => {
      item.callback();
    });
    
    setTimeout(processQueue, timeout);
  };
  
  return {
    add: (id, callback, priority = 0) => {
      //~ remove any existing items w this ID
      queue = queue.filter(item => item.id !== id);
      
      //~ add new item
      queue.push({
        id,
        callback,
        priority
      });
      
      //~ sort by prio (higher numbers = higher prio)
      queue.sort((a, b) => b.priority - a.priority);
      
      if (!isProcessing) {
        setTimeout(processQueue, 0);
      }
    }
  };
};
