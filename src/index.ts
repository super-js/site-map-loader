import {
    ISiteMapEntry,
    SiteMap,
    IndexedSiteMap,
    ISiteMapEntryGenerator,
    SiteMapGenerator,
    IInitSiteMap
} from "./types";

export function generateSiteMap(routeGenerators: SiteMapGenerator[], parentRouteNode?: ISiteMapEntryGenerator): SiteMap {
    return routeGenerators.reduce((_, generateRouteNodes) => {

        const generatedRoutes = generateRouteNodes();

        _.push(...generatedRoutes
            .map(generatedRoute => {

                const {to, path, children, permissions, ...other} = generatedRoute;

                const getPath = _path => `${parentRouteNode ? (Array.isArray(parentRouteNode.path) ?
                    parentRouteNode.path.join('') : parentRouteNode.path) : ''}${_path}`;

                const resolvedRoute = {
                    ...other,
                    to: data => (`${parentRouteNode ? parentRouteNode.to() : ''}${to(data)}`),
                    path: Array.isArray(path) ?
                        path.map(getPath) : getPath(path),
                    permissions : [
                        ...(parentRouteNode ? parentRouteNode.permissions : []),
                        ...permissions
                    ]
                };

                const childrenGenerators = Array.isArray(generatedRoute.children) ?
                    generatedRoute.children : [];

                if(typeof generatedRoute.children === "function") {
                    childrenGenerators.push(generatedRoute.children);
                }

                return Object.assign(resolvedRoute, {
                    children : childrenGenerators.length > 0 ?
                        generateSiteMap(childrenGenerators, resolvedRoute) : []
                });
            }));

        return _;
    }, []);
}

export function getIndexedSiteMap(siteMap: SiteMap): IndexedSiteMap {
    let routeTreeIndex = {} as IndexedSiteMap;

    const handleEntriesRecursively = (routeTreeEntries: ISiteMapEntry[], parentCode?: string) => {
        routeTreeEntries.forEach(routeTreeEntry => {

            if(!routeTreeIndex.hasOwnProperty(routeTreeEntry.code)) {
                const {children, ...routeTreeEntryProps} = routeTreeEntry;

                routeTreeIndex[routeTreeEntryProps.code as string] = {
                    ...routeTreeEntryProps,
                    parentCode
                };

                if(Array.isArray(children) && children.length > 0) {
                    handleEntriesRecursively(children, routeTreeEntryProps.code)
                }

            }

        });
    };
    handleEntriesRecursively(siteMap);

    return routeTreeIndex;
}

export function initSiteMap(routeGenerators: SiteMapGenerator[]): IInitSiteMap {

    const siteMap = generateSiteMap(routeGenerators);

    return {
        siteMap,
        indexedSiteMap: getIndexedSiteMap(siteMap)
    }
}

export * from "./types";