export default class DTDDHelper {
    constructor(){
        this.api_root = "https://www.doesthedogdie.com/dddsearch?q="
        this.api_key = "263a0d0f368673d9f7a690ef779f8440"
    }

    async getTriggerWarnings(title){
        const url = new URL(this.api_root + encodeURIComponent(title));
        url.searchParams.set('api_key', this.api_key);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json()

    }
}