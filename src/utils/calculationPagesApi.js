const calculationPagesApi = (indexGameInitial, indexGameFinal, size,residue ) => {
  // numero mas pequeño que cumpla con las siguientes condiciones, 1. debe ser mayor a "b-a", 2. num * multiplier debe ser mayor a b 3. el intervalo ((num)*(multiplier-1),(num*multiplier)) debe contener al intervalo((b-(b-a)), b), 4.  esta es la funcion base const calculationPageAndSizeApi = (a, b) => {
  let page = 1;
  
  while (size * page < indexGameFinal) {
    page++;
  }
if(residue == 0)
{
    return{
      pages:[1],

    }
}
    const pages = [page-1,page];

    

    const lowCutIndex =  indexGameInitial-((page-2)*size) -1
   const highCutIndex = +lowCutIndex + +size 
   
  
   return {
      pages,
      lowCutIndex,
      highCutIndex,
     
   }

};

module.exports = calculationPagesApi;
