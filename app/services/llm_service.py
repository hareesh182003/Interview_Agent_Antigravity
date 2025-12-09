import boto3
import json
import os
from typing import Optional

class LLMService:
    def __init__(self):
        self.bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        self.model_id = os.getenv("BEDROCK_MODEL_ID", "meta.llama3-70b-instruct-v1:0")

    def invoke_model(self, system_prompt: str, user_message: str, max_tokens: int = 2048, temperature: float = 0.7) -> str:
        if "mistral" in self.model_id:
            prompt = f"<s>[INST] {system_prompt} \n\n {user_message} [/INST]"
            body = json.dumps({
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "top_p": 0.9
            })
        else:
            # Metadata assumption: Llama 3
            prompt = f"""
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{system_prompt}
<|eot_id|><|start_header_id|>user<|end_header_id|>
{user_message}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
            body = json.dumps({
                "prompt": prompt,
                "max_gen_len": max_tokens,
                "temperature": temperature,
                "top_p": 0.9
            })

        try:
            response = self.bedrock_runtime.invoke_model(
                modelId=self.model_id,
                body=body
            )
            response_body = json.loads(response.get('body').read())
            
            if "mistral" in self.model_id:
                return response_body.get('outputs')[0].get('text')
            else:
                return response_body.get('generation')
        except Exception as e:
            print(f"Error invoking Bedrock model: {e}")
            return str(e)

llm_service = LLMService()
