console.log( "=== simpread util load ===" )

/**
 * Get exclude tags list
 * 
 * @param  {jquery} jquery object
 * @param  {array}  hidden html
 * @return {string} tags list string
 */
function excludeSelector( $target, exclude ) {
    let tags = [], tag = "";
    for ( let content of exclude ) {
        if ( specTest( content )) {
             const [ value, type ] = specAction( content );
             if ( type == 1 ) {
                 tag = value;
             } else if ( type == 2 ) {
                 const arr = $target.html().match( new RegExp( value, "g" ) );
                 if ( arr && arr.length > 0 ) {
                    const str = arr.join( "" );
                    tag = `*[${str}]`;
                 } else {
                     tag = undefined;
                 }
             }
        } else {
            tag = getSelector( content );
        }
        if ( tag ) tags.push( tag );
    }
    return tags.join( "," );
}

/**
 * Conver html to jquery object
 * 
 * @param  {string} input include html tag, e.g.:
    <div class="article fmt article__content">
 *
 * @return {string} formatting e.g.:
            h2#news_title
            div.introduction
            div.content
            div.clearfix
            div.rating_box
            span
 *
 */
function getSelector( html ) {
    if ( specTest( html )) return html;
    const item = html.match( /<\S+ (class|id)=("|')[\w-_]+|<[^/]\S+>/ig );
    if ( item && item.length > 0 ) {
        let [tag, prop, value] = item[0].trim().replace( /['"<>]/g, "" ).replace( / /ig, "=" ).split( "=" );  // ["h2", "class", "title"]
        if      ( !prop ) prop = tag;
        else if ( prop.toLowerCase() === "class") prop = `${tag}.${value}`;
        else if ( prop.toLowerCase() === "id"   ) prop = `${tag}#${value}`;
        return prop;
    } else {
        return null;
    }
}

/**
 * Verify special action, action include:
   - [[{juqery code}]] // new Function
   - [['text']]        // remove '<text>'
   - [[/regexp/]]      // regexp e.g. $("sr-rd-content").find( "*[src='http://ifanr-cdn.b0.upaiyun.com/wp-content/uploads/2016/09/AppSo-qrcode-signature.jpg']" )

 * 
 * @param  {string} verify content
 * @return {boolen} verify result
 */
function specTest( content ) {
    return /^(\[\[)[{'/]{1}[ \S]+[}'/]\]\]{1}($)/g.test( content );
}

/**
 * Exec special action, action include: @see specTest
 * 
 * @param  {string} content
 * @return {array}  0: result; 1: type( include: -1:error 0:{} 1:'' 2:// )
 */
function specAction( content ) {
    let [ value, type ] = [ content.replace( /(^)\[\[|\]\]$/g, "" ) ];
    switch (value[0]) {
        case "{":
            value      = value.replace( /^{|}$/g, "" );
            content    = ( v=>new Function( `return ${v}` )() )(value);
            type       = 0;
            break;
        case "'":
            content    = value.replace( /^'|'$/g, "" );
            const name = content.match(/^<[a-zA-Z0-9_-]+>/g).join("").replace( /<|>/g, "" );
            const str  = content.replace( /<[/a-zA-Z0-9_-]+>/g, "" );
            content    =  `${name}:contains(${str})`;
            type       = 1;
            break;
        case "/":
            content    = value.replace( /^\/|\/$/g, "" ).replace( /\\{2}/g, "" ).replace( /'/g, '"' );
            type       = 2;
            break;
        default:
            console.error( "Not support current action.", content )
            type       = -1;
            break;
    }
    return [ content, type ];
}

export {
    excludeSelector as exclude,
    getSelector     as selector,
    specTest        as specTest,
    specAction      as specAction
}