
export const SCHEDULE_STATE = {
    /**
     * 处理失败或者当前状态不允许
     */
    ERROR: -1,
    /**
     * 解码或者转码异常
     */
    FAIL: 0,
    /**
     * 读取中
     */
    READING: 1,
    /**
     * 转码中
     */
    TRANSCODING: 2,
    /**
     * 处理完成
     */
    DONE: 10,
};

/**
 * 初始化状态
 * @type {{OK: number, WAIT: number, FAIL: number}}
 */
export const INIT_STATE = {
    /**
     * 初始化中或者未初始化
     */
    WAIT: 0,
    /**
     * 初始化成功
     */
    OK: 1,
    /**
     * 初始化失败或异常
     */
    FAIL: -1,
    /**
     * 自动关闭子线程
     */
    CLOSE: -10
}
