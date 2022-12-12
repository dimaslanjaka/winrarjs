export interface CompressOptions {
    password?: string;
    comment?: string;
    /**
     * split volumes in Mega Byte
     */
    volumes?: number;
    /**
     * delete file after rar proccess completed
     */
    deleteAfter?: boolean;
    /**
     * compression level 0 - 5
     */
    level?: number;
    /**
     * output path
     */
    output: string;
}
export declare function compress(files: string[], output: CompressOptions): Promise<any>;
export declare function compress(files: string[], output: string, options: CompressOptions): Promise<any>;
//# sourceMappingURL=compress.d.ts.map