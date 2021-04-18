import { Collection } from "../Collections/Collection";

export interface CommonHandlerResult {
    success: Boolean,
    message: string,
    content?: any
}

export interface CollectionInterface {
    name: string;
    mangas: Array<CollectionMangaData>;
    count: number;
    addEntry( manga: CollectionMangaData ): void;
    removeEntry( manga: string ): CommonHandlerResult;
    editCollectionName( newName: string ): void;
}

export interface CollectionMangaData {
    title: string;
}

export interface CollectionSaveFile {
    save_data: Array<Collection>
}
