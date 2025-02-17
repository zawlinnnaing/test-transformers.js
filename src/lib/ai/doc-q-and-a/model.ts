import { SUPPORTED_MODELS } from "@/lib/shared/models";
import { assertNonEmpty, getIsGPUSupported } from "@/lib/shared/utils";
import cacheConnector from "@/lib/storage/cache-connector";
import {
  DocumentQuestionAnsweringPipeline,
  ImageInput,
  pipeline,
} from "@huggingface/transformers";

let pipelineInstance: DocumentQuestionAnsweringPipeline | undefined;
const docQAndModel = {
  async createPipeline() {
    if (pipelineInstance) {
      return pipelineInstance;
    }
    const isGPUSupported = await getIsGPUSupported();
    pipelineInstance = await pipeline(
      "document-question-answering",
      SUPPORTED_MODELS.docQAndA,
      isGPUSupported
        ? {
            device: "webgpu",
          }
        : undefined,
    );
    cacheConnector.syncCacheToDatabase();
    return pipelineInstance;
  },

  async answer(image: ImageInput, question: string) {
    assertNonEmpty(pipelineInstance, "Pipeline not created yet.");
    return pipelineInstance(image, question);
  },

  async dispose() {
    pipelineInstance = undefined;
  },
};

export type DocQAndAModel = typeof docQAndModel;

export default docQAndModel;
