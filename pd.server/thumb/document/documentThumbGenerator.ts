import {IThumbGenerator} from "../thumbGenerators.ts";
import {IDocumentThumbGeneratorConfig} from '../../config/models.ts';
import {SupportedFileType} from '../../../shared/isFileSupported.ts';

export const documentThumbGenerator: IThumbGenerator<SupportedFileType.DOCUMENT> =
  async (
    filePath: string,
    config: IDocumentThumbGeneratorConfig,
  ): Promise<void> => {
    throw new Error('not implemented');
  };
