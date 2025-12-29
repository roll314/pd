import {SupportedFileType} from "../../shared/isFileSupported.ts";
import {imageThumbGenerator} from "./image/imageThumbGenerator.ts";
import {
  IDocumentThumbGeneratorConfig,
  IImageThumbGeneratorConfig,
  IVideoThumbGeneratorConfig,
} from "../config/models.ts";
import { documentThumbGenerator } from './document/documentThumbGenerator.ts';
import { videoThumbGenerator } from './video/videoThumbGenerator.ts';

export type ThumbGeneratorConfigMap = {
  [SupportedFileType.IMAGE]: IImageThumbGeneratorConfig;
  [SupportedFileType.VIDEO]: IVideoThumbGeneratorConfig;
  [SupportedFileType.DOCUMENT]: IDocumentThumbGeneratorConfig;
};

export type IThumbGenerator<K extends SupportedFileType> = (
  filePath: string,
  config: ThumbGeneratorConfigMap[K],
) => Promise<void>;

export type IThumbGenerators = {
  [K in SupportedFileType]?: IThumbGenerator<K>;
};

export const THUMB_GENERATORS: IThumbGenerators = {
  [SupportedFileType.IMAGE]: imageThumbGenerator,
  [SupportedFileType.VIDEO]: videoThumbGenerator,
  [SupportedFileType.DOCUMENT]: documentThumbGenerator,
};
