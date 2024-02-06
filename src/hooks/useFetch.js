export default async function useFetch(url, cachTime) {
    const abort = new AbortController();    
    try {
        const response = await fetch(url, {

            next: {
                revalidate: cachTime
            },

            signal: abort.signal
            
        });
        if (!response.ok) throw new Error('response is not ok'); 
        return response.json();
    } 
    catch (error) {
        if (error.name === 'AbortError') console.log("fetch aborted")
        console.log(error.message);
    }
    return() => abort.abort();
}