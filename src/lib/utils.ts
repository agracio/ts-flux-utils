export class Utils{
    // https://stackoverflow.com/a/45322101
    public static getObjectByKey(obj: any, key: string){
        if(key.indexOf('.') !== 1){
            return key.split('.').reduce(function(prev, curr) {
                return prev ? prev[curr] : null
            }, obj)
        }else{
            return obj[key];
        }
    }
}