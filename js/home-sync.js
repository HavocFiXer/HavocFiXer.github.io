/**
 * Pulls featured items from publications.html and news.html into the homepage.
 * Mark source items with data-home (optional data-home-order: lower = earlier).
 * Default list content comes from <template> (file:// and failed fetch keep that).
 */
(function () {
    var MAX_PUBS = 12;
    var MAX_NEWS = 8;

    function parseOrder(el) {
        var v = el.getAttribute("data-home-order");
        if (v === null || v === "") {
            return 999;
        }
        var n = parseInt(v, 10);
        return isNaN(n) ? 999 : n;
    }

    /** Full card clone (pub-head / pub-main / pub-foot); strip flags so home list matches publications.html layout only. */
    function clonePublicationForHome(src) {
        var li = src.cloneNode(true);
        li.removeAttribute("data-home");
        li.removeAttribute("data-home-order");
        if (li.id) {
            li.removeAttribute("id");
        }
        return li;
    }

    function applyTemplate(listId, templateId) {
        var list = document.getElementById(listId);
        var tmpl = document.getElementById(templateId);
        if (!list || !tmpl || !tmpl.content) {
            return;
        }
        list.innerHTML = "";
        var frag = tmpl.content.cloneNode(true);
        while (frag.firstChild) {
            list.appendChild(frag.firstChild);
        }
    }

    function loadFeaturedPublications() {
        var list = document.getElementById("home-publications-list");
        if (!list) {
            return;
        }
        fetch("publications.html", { cache: "no-cache" })
            .then(function (r) {
                if (!r.ok) {
                    throw new Error(r.status);
                }
                return r.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, "text/html");
                var items = Array.prototype.slice.call(
                    doc.querySelectorAll("ul.publication-list > li.publication-item[data-home]")
                );
                if (!items.length) {
                    return;
                }
                items.sort(function (a, b) {
                    return parseOrder(a) - parseOrder(b);
                });
                list.innerHTML = "";
                items.slice(0, MAX_PUBS).forEach(function (li) {
                    list.appendChild(clonePublicationForHome(li));
                });
            })
            .catch(function () {});
    }

    function loadFeaturedNews() {
        var list = document.getElementById("home-news-list");
        if (!list) {
            return;
        }
        fetch("news.html", { cache: "no-cache" })
            .then(function (r) {
                if (!r.ok) {
                    throw new Error(r.status);
                }
                return r.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, "text/html");
                var items = Array.prototype.slice.call(
                    doc.querySelectorAll("ul.news-list > li.news-item[data-home]")
                );
                if (!items.length) {
                    return;
                }
                items.sort(function (a, b) {
                    return parseOrder(a) - parseOrder(b);
                });
                list.innerHTML = "";
                items.slice(0, MAX_NEWS).forEach(function (src) {
                    var li = src.cloneNode(true);
                    li.removeAttribute("data-home");
                    li.removeAttribute("data-home-order");
                    list.appendChild(li);
                });
            })
            .catch(function () {});
    }

    document.addEventListener("DOMContentLoaded", function () {
        applyTemplate("home-publications-list", "home-publications-fallback-tmpl");
        applyTemplate("home-news-list", "home-news-fallback-tmpl");
        if (location.protocol === "file:") {
            return;
        }
        loadFeaturedPublications();
        loadFeaturedNews();
    });
})();
