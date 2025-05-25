import { Handle, Position } from '@xyflow/react'
import { HelpCircle } from 'lucide-react'

const subtypeMap: Record<
    string,
    { icon: string; label: string }
> = {
    lambda: {
        icon: 'https://img.icons8.com/color/512/awslambda.png',
        label: 'AWS Lambda',
    },
    sqs: {
        icon: 'https://svgmix.com/uploads/a5ceec-aws-mq.svg',
        label: 'AWS SQS',
    },
}

const AWS = ({
    data,
}: {
    data: { label: string; type: string; subType: string }
}) => {
    const subtype = subtypeMap[data.subType]

    return (
        <div className="rounded-sm border bg-background text-white">
            <div className="flex items-center justify-start w-56 divide-x">
                <div className="p-3">
                    {subtype ? (
                        <img src={subtype.icon} className="w-8 h-8" alt={subtype.label} />
                    ) : (
                        <HelpCircle className="w-8 h-8 text-red-500" />
                    )}
                </div>
                <div className="grow px-3">
                    <p className="text-sm capitalize">{data.label}</p>
                    {
                        subtype ? <img
                            src="https://www.kaizenanalytix.com/wp-content/uploads/2024/09/aws-white.png"
                            className="w-6 h-5"
                            alt="AWS"
                        /> : <p></p>
                    }
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="bg-white w-2 h-2" />
            <Handle type="source" position={Position.Bottom} className="bg-white w-2 h-2" />
        </div>
    )
}

export default AWS
