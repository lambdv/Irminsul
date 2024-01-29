export default async function useFetch(url) {
    try{
        const response = await fetch(url)
        return response.json() 
    }
    catch(error){ console.log(error) }

}