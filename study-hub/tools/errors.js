()=>"errors: "+JSON.stringify(window.__errs)+" | visible: "+[...document.querySelectorAll(".chapter:not([hidden]),#v-home:not([hidden]),#v-course:not([hidden])")].map(e=>e.id).join(",")
