count=$(wc -l < /scripts/cookie.list) 
for i in $(seq 0 $count)  
do    
node /scripts/*$1.js $i& 
done   
 